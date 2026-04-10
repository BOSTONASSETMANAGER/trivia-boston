'use server';

import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hashPassword, verifyPassword, sha256Hex } from '@/lib/auth/hash';
import type { TriviaUser } from '@/types/game';

type AuthResult =
  | { ok: true; user: TriviaUser }
  | { ok: false; error: string };

// ─── Anti-abuse limits ──────────────────────────────────────
const MAX_REGISTRATIONS_PER_IP_24H = 3;
const MAX_FAILED_LOGINS_PER_15MIN = 5;

async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return h.get('x-real-ip') ?? '0.0.0.0';
}

async function logAttempt(
  kind: 'register' | 'login',
  email: string | null,
  ipHash: string,
  fingerprintHash: string,
  success: boolean
) {
  const supabase = createSupabaseServerClient();
  await supabase.from('trivia_attempts').insert({
    kind,
    email,
    ip_hash: ipHash,
    fingerprint_hash: fingerprintHash,
    success,
  });
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  fingerprintHash: string
): Promise<AuthResult> {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName || !trimmedEmail || !password) {
    return { ok: false, error: 'Completá todos los campos' };
  }
  if (password.length < 4) {
    return { ok: false, error: 'La contraseña debe tener al menos 4 caracteres' };
  }
  if (!fingerprintHash || fingerprintHash.length < 10) {
    return { ok: false, error: 'No se pudo verificar el dispositivo' };
  }

  const ip = await getClientIp();
  const h = await headers();
  const userAgent = h.get('user-agent') ?? '';
  const ipHash = await sha256Hex(ip);

  const supabase = createSupabaseServerClient();

  // Anti-abuse: fingerprint ya registrado
  const { data: fpExisting } = await supabase
    .from('trivia_fingerprints')
    .select('id')
    .eq('fingerprint_hash', fingerprintHash)
    .limit(1);

  if (fpExisting && fpExisting.length > 0) {
    await logAttempt('register', trimmedEmail, ipHash, fingerprintHash, false);
    return {
      ok: false,
      error: 'Ya existe una cuenta registrada desde este dispositivo',
    };
  }

  // Anti-abuse: max N registros por IP en 24h
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: ipRegCount } = await supabase
    .from('trivia_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('kind', 'register')
    .eq('success', true)
    .eq('ip_hash', ipHash)
    .gte('created_at', since24h);

  if ((ipRegCount ?? 0) >= MAX_REGISTRATIONS_PER_IP_24H) {
    await logAttempt('register', trimmedEmail, ipHash, fingerprintHash, false);
    return {
      ok: false,
      error: 'Demasiados registros desde esta red. Intentá mas tarde.',
    };
  }

  // Email unico
  const { data: existing } = await supabase
    .from('trivia_users')
    .select('id')
    .eq('email', trimmedEmail)
    .limit(1);

  if (existing && existing.length > 0) {
    await logAttempt('register', trimmedEmail, ipHash, fingerprintHash, false);
    return { ok: false, error: 'Ese email ya esta en uso' };
  }

  const passwordHash = await hashPassword(password);

  const { data: inserted, error } = await supabase
    .from('trivia_users')
    .insert({ name: trimmedName, email: trimmedEmail, password_hash: passwordHash })
    .select('id, name, email')
    .single();

  if (error || !inserted) {
    console.error('[registerUser] trivia_users insert failed:', {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
    });
    await logAttempt('register', trimmedEmail, ipHash, fingerprintHash, false);
    const detail =
      error?.message ?? (inserted ? 'select vacio' : 'sin datos');
    return {
      ok: false,
      error: `No se pudo crear la cuenta [${error?.code ?? 'nil'}]: ${detail}`,
    };
  }

  // Registrar el fingerprint del dispositivo
  await supabase.from('trivia_fingerprints').insert({
    user_id: inserted.id,
    ip_hash: ipHash,
    fingerprint_hash: fingerprintHash,
    user_agent: userAgent,
  });

  await logAttempt('register', trimmedEmail, ipHash, fingerprintHash, true);

  return {
    ok: true,
    user: { id: inserted.id, name: inserted.name, email: inserted.email },
  };
}

export async function loginUser(
  email: string,
  password: string,
  fingerprintHash: string
): Promise<AuthResult> {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail || !password) {
    return { ok: false, error: 'Completá todos los campos' };
  }
  if (!fingerprintHash || fingerprintHash.length < 10) {
    return { ok: false, error: 'No se pudo verificar el dispositivo' };
  }

  const ip = await getClientIp();
  const ipHash = await sha256Hex(ip);
  const supabase = createSupabaseServerClient();

  // Anti-abuse: demasiados fallos recientes
  const since15min = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { count: failedCount } = await supabase
    .from('trivia_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('kind', 'login')
    .eq('success', false)
    .eq('ip_hash', ipHash)
    .eq('fingerprint_hash', fingerprintHash)
    .gte('created_at', since15min);

  if ((failedCount ?? 0) >= MAX_FAILED_LOGINS_PER_15MIN) {
    return {
      ok: false,
      error: 'Demasiados intentos fallidos. Esperá 15 minutos.',
    };
  }

  const { data: user } = await supabase
    .from('trivia_users')
    .select('id, name, email, password_hash')
    .eq('email', trimmedEmail)
    .maybeSingle();

  if (!user) {
    await logAttempt('login', trimmedEmail, ipHash, fingerprintHash, false);
    return { ok: false, error: 'Email o contraseña incorrectos' };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    await logAttempt('login', trimmedEmail, ipHash, fingerprintHash, false);
    return { ok: false, error: 'Email o contraseña incorrectos' };
  }

  // Anti-abuse: verificar que este fingerprint pertenezca a este user
  // (o sea un fingerprint no registrado a nadie)
  const { data: fpOwner } = await supabase
    .from('trivia_fingerprints')
    .select('user_id')
    .eq('fingerprint_hash', fingerprintHash)
    .maybeSingle();

  if (fpOwner && fpOwner.user_id !== user.id) {
    await logAttempt('login', trimmedEmail, ipHash, fingerprintHash, false);
    return {
      ok: false,
      error: 'Este dispositivo ya esta asociado a otra cuenta',
    };
  }

  // Si no hay fingerprint registrado aun para este user, lo registramos
  if (!fpOwner) {
    const h = await headers();
    await supabase.from('trivia_fingerprints').insert({
      user_id: user.id,
      ip_hash: ipHash,
      fingerprint_hash: fingerprintHash,
      user_agent: h.get('user-agent') ?? '',
    });
  }

  await logAttempt('login', trimmedEmail, ipHash, fingerprintHash, true);

  return {
    ok: true,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

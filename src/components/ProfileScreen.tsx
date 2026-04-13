'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { LogOut, ChevronRight, ArrowLeft, Lock, X } from 'lucide-react';
import {
  MEDAL_CATALOG,
  CATEGORY_LABELS,
  TIER_COLORS,
  type Medal,
  type MedalCategory,
} from '@/lib/medals/catalog';
import { getAvatarForUser } from '@/lib/avatar';

interface ProfileScreenProps {
  userId: string;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  unlockedIds?: string[];
}

export default function ProfileScreen({
  userId,
  userName,
  userEmail,
  onLogout,
  unlockedIds = [],
}: ProfileScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const fadeDuration = prefersReducedMotion ? 0 : 0.4;
  const unlockedSet = new Set(unlockedIds);
  const unlockedCount = MEDAL_CATALOG.filter((m) => unlockedSet.has(m.id)).length;
  const totalCount = MEDAL_CATALOG.length;
  const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const avatarSrc = getAvatarForUser(userId);
  const [selectedCategory, setSelectedCategory] = useState<MedalCategory | null>(null);

  const grouped = MEDAL_CATALOG.reduce(
    (acc, medal) => {
      (acc[medal.category] ||= []).push(medal);
      return acc;
    },
    {} as Record<MedalCategory, Medal[]>,
  );

  const categories = Object.keys(grouped) as MedalCategory[];

  const stagger = (i: number, base = 0.1) =>
    prefersReducedMotion ? 0 : base + i * 0.04;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: fadeDuration }}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center px-5"
      style={{
        paddingTop: 'max(2rem, calc(env(safe-area-inset-top, 0px) + 2rem))',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)',
      }}
    >
      {/* White container wrapping entire profile */}
      <div className="glass-card-elevated flex w-full max-w-sm flex-1 flex-col rounded-2xl p-5">
        {/* 1. Profile header strip */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: stagger(0, 0.05) }}
          className="mb-3 flex items-center gap-3"
        >
          <div className="relative shrink-0">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-primary/30 shadow-[0_4px_15px_rgba(29,57,105,0.12)]">
              <Image
                src={avatarSrc}
                alt={userName}
                fill
                sizes="56px"
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-secondary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="boston-title truncate text-lg">{userName}</h1>
            <p className="truncate text-xs text-outline">{userEmail}</p>
          </div>
        </motion.div>

        {/* 2. Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: stagger(1, 0.1) }}
          className="mb-3 grid grid-cols-3 gap-2"
        >
          <div className="rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-2.5 text-center">
            <p className="boston-title text-xl">
              {unlockedCount}
              <span className="text-outline text-sm">/{totalCount}</span>
            </p>
            <p className="text-[9px] uppercase tracking-wider text-outline">
              Medallas
            </p>
          </div>
          <div className="rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-2.5 text-center">
            <p className="boston-title text-xl">{progressPct}%</p>
            <p className="text-[9px] uppercase tracking-wider text-outline">
              Progreso
            </p>
          </div>
          <div className="rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-2.5 text-center">
            <p className="boston-title text-xl text-outline/40">&mdash;</p>
            <p className="text-[9px] uppercase tracking-wider text-outline">
              Partidas
            </p>
          </div>
        </motion.div>

        {/* 3. Medal progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: stagger(2, 0.15) }}
          className="mb-3"
        >
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface/60">
              Progreso
            </span>
            <span className="font-mono text-[11px] tabular-nums text-on-surface">
              <span className="font-bold text-primary">{progressPct}</span>
              <span className="text-outline">%</span>
            </span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-[#e2e8f0]"
            role="progressbar"
            aria-valuenow={unlockedCount}
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-label={`Medallas desbloqueadas: ${unlockedCount} de ${totalCount}`}
          >
            <motion.div
              initial={{ width: prefersReducedMotion ? `${progressPct}%` : 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { delay: 0.3, duration: 0.8, ease: 'easeOut' }
              }
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(135deg, #1d3969, #2563eb)',
                boxShadow: '0 0 6px rgba(37,99,235,0.4)',
              }}
            />
          </div>
        </motion.div>

        {/* 4. Category list — compact clickable rows */}
        <div className="mb-3 flex flex-1 flex-col gap-1.5">
          <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface/50 mb-0.5">
            Categorias
          </p>
          {categories.map((category, i) => {
            const medals = grouped[category];
            const catUnlocked = medals.filter((m) => unlockedSet.has(m.id)).length;
            const catTotal = medals.length;
            const allDone = catUnlocked === catTotal;
            const noneDone = catUnlocked === 0;
            const Icon = medals[0].icon;

            return (
              <motion.button
                key={category}
                type="button"
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: -6 }
                }
                animate={{ opacity: 1, x: 0 }}
                transition={
                  prefersReducedMotion
                    ? { delay: 0, duration: 0.15 }
                    : { delay: stagger(i, 0.2) }
                }
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2.5 rounded-xl border bg-[#f8fafc] px-3 py-2 text-left transition-all hover:shadow-[0_4px_15px_rgba(29,57,105,0.1)] hover:border-primary/30 active:scale-[0.98] ${
                  allDone ? 'border-secondary/40' : 'border-[#e2e8f0]'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    noneDone
                      ? 'bg-[#e2e8f0] text-outline/40'
                      : 'bg-gradient-to-br from-[rgba(29,57,105,0.08)] to-[rgba(37,99,235,0.08)] text-[#1d3969]'
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold ${noneDone ? 'text-outline/60' : 'text-on-surface'}`}>
                    {CATEGORY_LABELS[category]}
                  </p>
                </div>
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    allDone
                      ? 'font-bold text-secondary'
                      : noneDone
                        ? 'text-outline/50'
                        : 'text-primary'
                  }`}
                >
                  {catUnlocked}/{catTotal}
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-outline/40" aria-hidden="true" />
              </motion.button>
            );
          })}
        </div>

        {/* 5. Logout */}
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.5 }}
          onClick={onLogout}
          aria-label="Cerrar sesion"
          className="mt-auto flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-tertiary/40 bg-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider text-tertiary transition-all hover:border-tertiary/60 hover:bg-tertiary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 touch-manipulation"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
          Cerrar sesion
        </motion.button>
      </div>

      {/* Category detail overlay */}
      <AnimatePresence>
        {selectedCategory && (
          <CategoryDetail
            category={selectedCategory}
            medals={grouped[selectedCategory]}
            unlockedSet={unlockedSet}
            onClose={() => setSelectedCategory(null)}
            reduceMotion={!!prefersReducedMotion}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CategoryDetail({
  category,
  medals,
  unlockedSet,
  onClose,
  reduceMotion,
}: {
  category: MedalCategory;
  medals: Medal[];
  unlockedSet: Set<string>;
  onClose: () => void;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/25" />

      {/* Panel */}
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
        animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
        transition={
          reduceMotion
            ? { duration: 0.15 }
            : { type: 'spring', damping: 28, stiffness: 300 }
        }
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-sm rounded-t-2xl bg-white p-5 shadow-[0_-8px_30px_rgba(29,57,105,0.15)]"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)',
          maxHeight: '75dvh',
          overflowY: 'auto',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Medallas de ${CATEGORY_LABELS[category]}`}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-outline transition-colors hover:text-on-surface"
            aria-label="Volver"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="boston-title text-base">{CATEGORY_LABELS[category]}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-outline transition-colors hover:text-on-surface"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="divider-glow mb-4" />

        {/* Medal list */}
        <div className="space-y-2.5">
          {medals.map((medal, i) => {
            const unlocked = unlockedSet.has(medal.id);
            const tierColors = TIER_COLORS[medal.tier];
            const Icon = medal.icon;

            return (
              <motion.div
                key={medal.id}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { delay: 0, duration: 0.1 }
                    : { delay: 0.1 + i * 0.05 }
                }
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  unlocked
                    ? `${tierColors.border} bg-white`
                    : 'border-[#e2e8f0] bg-[#f8fafc]'
                }`}
                style={unlocked ? { boxShadow: `0 2px 12px ${tierColors.glow}` } : undefined}
              >
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    unlocked
                      ? `${tierColors.bg} ${tierColors.text}`
                      : 'bg-[#e2e8f0] text-outline/40'
                  }`}
                >
                  {unlocked ? (
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  ) : (
                    <Lock className="h-4 w-4" strokeWidth={2.5} />
                  )}
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold ${unlocked ? 'text-on-surface' : 'text-on-surface/50'}`}>
                    {medal.name}
                  </p>
                  <p className={`text-[10px] leading-tight ${unlocked ? 'text-outline' : 'text-outline/60'}`}>
                    {unlocked ? medal.description : medal.hint}
                  </p>
                </div>

                {/* Tier badge */}
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                    unlocked
                      ? `${tierColors.text} ${tierColors.bg}`
                      : 'bg-[#f8fafc] text-outline/40'
                  }`}
                >
                  {medal.tier}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

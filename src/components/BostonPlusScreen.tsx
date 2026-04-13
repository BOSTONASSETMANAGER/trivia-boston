'use client';

import { motion, useReducedMotion } from 'motion/react';
import {
  Sparkles,
  Check,
  TrendingUp,
  FileText,
  Bell,
  BarChart3,
  Calculator,
  MessageCircle,
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Plan {
  id: 'freemium' | 'premium' | 'premium-plus';
  name: string;
  tagline: string;
  priceMonthly: string;
  priceQuarterly?: string;
  icon: LucideIcon;
  features: string[];
  highlight?: boolean;
  ribbon?: string;
}

const PLANS: Plan[] = [
  {
    id: 'freemium',
    name: 'Freemium',
    tagline: 'Sin costo',
    priceMonthly: 'Gratis',
    icon: Sparkles,
    features: [
      'Acceso limitado a contenido exclusivo',
      'Registro sin compromiso',
      'Prueba de funcionalidades base',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Para inversores activos',
    priceMonthly: '$25.000',
    priceQuarterly: '$67.500',
    icon: TrendingUp,
    highlight: true,
    features: [
      'Instrumento del Dia',
      'Informes de Valor Razonable',
      'Informes macro, renta fija y variable',
      'Trade Ideas y alertas por email',
      'Carteras optimizadas por perfil',
      'Actualizacion diaria (dias habiles)',
    ],
  },
  {
    id: 'premium-plus',
    name: 'Premium +',
    tagline: 'Asesoramiento a medida',
    priceMonthly: '$35.000',
    priceQuarterly: '$94.500',
    icon: Star,
    features: [
      'Todo lo incluido en Premium',
      'Carteras personalizadas por objetivos',
      'Comentarios exclusivos de analistas',
      'Calculadoras de simulacion',
      'Asesoramiento estrategico de largo plazo',
    ],
  },
];

const BENEFITS: { icon: LucideIcon; label: string }[] = [
  { icon: BarChart3, label: 'Analisis diario' },
  { icon: FileText, label: 'Informes' },
  { icon: Bell, label: 'Alertas' },
  { icon: Calculator, label: 'Calculadoras' },
];

export default function BostonPlusScreen() {
  const prefersReducedMotion = useReducedMotion();
  const fadeDuration = prefersReducedMotion ? 0 : 0.4;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: fadeDuration }}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center px-4 sm:px-6"
      style={{
        paddingTop: 'max(2rem, calc(env(safe-area-inset-top, 0px) + 2rem))',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)',
      }}
    >
      {/* White container — wider on desktop */}
      <div className="glass-card-elevated flex w-full max-w-sm sm:max-w-lg md:max-w-3xl flex-col rounded-2xl p-5 sm:p-6 md:p-8">
        {/* Header — compact */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 sm:mb-5 text-center"
        >
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="boston-overline !text-[10px]">Boston+</span>
          </div>
          <h1 className="boston-title mb-1 text-2xl sm:text-3xl">Suscripciones</h1>
          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-outline/90">
            Analisis de mercado, informes financieros y alertas de oportunidades
            para decisiones de inversion informadas.
          </p>
        </motion.div>

        {/* Benefits strip — inline on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 sm:mb-5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-3 sm:p-4"
        >
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.label}
                  className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2 sm:justify-center"
                >
                  <div className="boston-icon-box-sm sm:h-9 sm:w-9">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.8} />
                  </div>
                  <span className="text-center text-[9px] sm:text-[11px] font-medium leading-tight text-on-surface/80">
                    {b.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Section label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="boston-overline mb-3 sm:mb-4"
        >
          Elegi tu plan
        </motion.p>

        {/* Plan cards — stacked on mobile, 3 columns on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
          {PLANS.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              delay={prefersReducedMotion ? 0 : 0.35 + i * 0.1}
              reduceMotion={!!prefersReducedMotion}
            />
          ))}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3 sm:p-4 text-center"
        >
          <p className="mb-0.5 text-[11px] sm:text-xs font-semibold text-on-surface">
            Planes trimestrales con 10% de descuento
          </p>
          <p className="text-[10px] sm:text-[11px] text-outline">
            Pago con tarjeta (Mercado Pago) o transferencia bancaria.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

function PlanCard({
  plan,
  delay,
  reduceMotion,
}: {
  plan: Plan;
  delay: number;
  reduceMotion: boolean;
}) {
  const Icon = plan.icon;
  const isHighlight = plan.highlight;

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { delay: 0, duration: 0.15 }
          : { delay, type: 'spring', stiffness: 200, damping: 22 }
      }
      className={`relative flex flex-col rounded-2xl p-4 sm:p-5 ${
        isHighlight
          ? 'bg-white border-[1.5px] border-primary/35 shadow-[0_10px_35px_rgba(37,99,235,0.18)]'
          : 'bg-[#f8fafc] border border-[#e2e8f0]'
      }`}
    >
      {/* Ribbon */}
      {plan.ribbon && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <div
            className="boston-cta px-3 py-1 text-[9px]"
            style={{ letterSpacing: '0.08em', borderRadius: '999px' }}
          >
            {plan.ribbon}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-3 flex items-center gap-2.5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isHighlight
              ? 'bg-gradient-to-br from-[rgba(29,57,105,0.15)] to-[rgba(37,99,235,0.18)] text-[#1d3969]'
              : 'bg-gradient-to-br from-[rgba(29,57,105,0.08)] to-[rgba(37,99,235,0.08)] text-[#1d3969]'
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="boston-title text-base sm:text-lg leading-tight">{plan.name}</h3>
          <p className="text-[10px] sm:text-[11px] text-outline">{plan.tagline}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-3 flex items-baseline gap-1.5 border-b border-[#e2e8f0] pb-3">
        <span
          className={`font-headline font-bold tabular-nums ${
            isHighlight ? 'text-primary' : 'text-on-surface'
          } ${plan.priceMonthly === 'Gratis' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}
          style={{ letterSpacing: '-0.02em' }}
        >
          {plan.priceMonthly}
        </span>
        {plan.priceMonthly !== 'Gratis' && (
          <span className="text-[11px] text-outline">/mes</span>
        )}
        {plan.priceQuarterly && (
          <span className="ml-auto text-[10px] text-outline/80">
            {plan.priceQuarterly}/trim
          </span>
        )}
      </div>

      {/* Features */}
      <ul className="mb-4 flex-1 space-y-1.5">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <div
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                isHighlight
                  ? 'bg-primary text-on-primary'
                  : 'bg-secondary/15 text-secondary'
              }`}
            >
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </div>
            <span className="text-[11px] sm:text-[12px] leading-snug text-on-surface/85">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isHighlight ? (
        <button
          type="button"
          aria-label={`Consultar plan ${plan.name}`}
          className="boston-cta btn-shine flex min-h-[44px] w-full items-center justify-center gap-2 px-4 py-2.5 text-[11px] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
          Consultar plan
        </button>
      ) : (
        <button
          type="button"
          aria-label={
            plan.priceMonthly === 'Gratis'
              ? `Comenzar gratis con el plan ${plan.name}`
              : `Consultar plan ${plan.name}`
          }
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-white px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-primary transition-all hover:bg-primary/5 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 touch-manipulation"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {plan.priceMonthly === 'Gratis' ? 'Comenzar gratis' : 'Consultar plan'}
        </button>
      )}
    </motion.div>
  );
}

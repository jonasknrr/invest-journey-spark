import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { useProgressStore } from '@/hooks/useProgressStore';

const BLUE = '#1A56DB';

interface CardProps {
  icon: string;
  title: string;
  subtext: string;
  badge?: string;
  badgeColor?: string;
  borderColor?: string;
}

const InfoCard = ({ icon, title, subtext, badge, badgeColor = 'bg-green-100 text-green-700', borderColor = 'border-l-blue-500' }: CardProps) => (
  <div className={`rounded-xl border border-border bg-card p-3 flex gap-3 items-start border-l-4 ${borderColor}`}>
    <span className="text-2xl mt-0.5">{icon}</span>
    <div className="flex-1">
      <p className="font-display text-sm font-bold text-foreground">{title}</p>
      <p className="font-body text-xs text-muted-foreground">{subtext}</p>
      {badge && (
        <span className={`inline-block mt-1.5 font-body text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
          {badge}
        </span>
      )}
    </div>
  </div>
);

const Cash_F1_WhatIsCash = () => {
  const navigate = useNavigate();
  const { updateLessonProgress } = useProgressStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts] = useState(3);
  const totalSteps = 3;
  const progress = ((currentStep) / (totalSteps - 1)) * 100;

  // Track progress
  useEffect(() => {
    updateLessonProgress('festgeld-f1', Math.min(currentStep / (totalSteps - 1), 1));
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep >= totalSteps - 1) {
      navigate('/category/festgeld');
      return;
    }
    setCurrentStep(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/category/festgeld')}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: BLUE }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[0, 1, 2].map(i => (
            <Heart
              key={i}
              className={`w-5 h-5 transition-all ${
                i < hearts ? 'text-red-500 fill-red-500' : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* ── Slide 1: Die Metapher ── */}
        {currentStep === 0 && (
          <motion.div
            key="slide0"
            className="flex-1 flex flex-col px-6 py-6 overflow-y-auto"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center text-center mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground leading-tight">
                Du kennst eine Wasserflasche?
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full mb-6">
              <div className="rounded-2xl bg-muted p-4 flex flex-col items-center text-center gap-2">
                <span className="text-3xl">💧</span>
                <p className="font-body text-sm font-medium text-foreground">Eine Wasserflasche</p>
                <p className="font-body text-xs text-muted-foreground">= sofort trinkbar</p>
              </div>
              <div className="rounded-2xl p-4 flex flex-col items-center text-center gap-2" style={{ backgroundColor: '#EFF6FF' }}>
                <span className="text-3xl">🏦</span>
                <p className="font-body text-sm font-medium text-foreground">Cash auf dem Konto</p>
                <p className="font-body text-xs" style={{ color: BLUE }}>= sofort verfügbar</p>
              </div>
            </div>

            <p className="font-body text-sm text-muted-foreground text-center max-w-xs mx-auto mb-6">
              Cash ist wie Wasser in einer Flasche — immer sofort nutzbar.
            </p>

            <div className="flex justify-end mt-auto">
              <button
                onClick={handleNext}
                className="font-body text-sm font-medium text-foreground border border-border rounded-full px-4 py-2 hover:bg-muted transition-colors"
              >
                Nächste →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Slide 2: Was gehört dazu? ── */}
        {currentStep === 1 && (
          <motion.div
            key="slide1"
            className="flex-1 flex flex-col px-6 py-6 overflow-y-auto"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-5">
              Cash ist nicht nur Bargeld.
            </h2>

            <div className="flex flex-col gap-3 max-w-sm mx-auto w-full mb-5">
              <InfoCard
                icon="💵"
                title="Bargeld"
                subtext="Scheine und Münzen in deiner Tasche"
                badge="Sofort verfügbar"
                badgeColor="bg-green-100 text-green-700"
                borderColor="border-l-blue-500"
              />
              <InfoCard
                icon="🏦"
                title="Girokonto"
                subtext="Dein alltägliches Bankkonto"
                badge="Sofort verfügbar"
                badgeColor="bg-green-100 text-green-700"
                borderColor="border-l-blue-500"
              />
              <InfoCard
                icon="💰"
                title="Tagesgeldkonto"
                subtext="Sparkonto mit täglicher Verfügbarkeit"
                badge="Cash Equivalent"
                badgeColor="bg-blue-100 text-blue-700"
                borderColor="border-l-blue-500"
              />
              <InfoCard
                icon="📗"
                title="Sparbuch"
                subtext="Klassische Sparform mit kleinen Zinsen"
                badge="Cash Equivalent"
                badgeColor="bg-blue-100 text-blue-700"
                borderColor="border-l-blue-500"
              />
            </div>

            <div className="rounded-xl border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 max-w-sm mx-auto w-full mb-5">
              <p className="font-body text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                💡 Cash Equivalents sind fast so gut wie Cash — nur mit etwas mehr Zinsen.
              </p>
            </div>

            <div className="flex justify-end mt-auto">
              <button
                onClick={handleNext}
                className="font-body text-sm font-medium text-foreground border border-border rounded-full px-4 py-2 hover:bg-muted transition-colors"
              >
                Weiter →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Slide 3: Was ist KEIN Cash ── */}
        {currentStep === 2 && (
          <motion.div
            key="slide2"
            className="flex-1 flex flex-col px-6 py-6 overflow-y-auto"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-xl font-bold text-foreground text-center mb-5">
              Das hier ist kein Cash.
            </h2>

            <div className="flex flex-col gap-3 max-w-sm mx-auto w-full mb-5">
              <InfoCard
                icon="📈"
                title="Aktien"
                subtext="Wert schwankt täglich — nicht sofort sicher verfügbar"
                badge="Kein Cash"
                badgeColor="bg-red-100 text-red-700"
                borderColor="border-l-red-400"
              />
              <InfoCard
                icon="🏠"
                title="Immobilie"
                subtext="Verkauf dauert Monate"
                badge="Kein Cash"
                badgeColor="bg-red-100 text-red-700"
                borderColor="border-l-red-400"
              />
              <InfoCard
                icon="🔒"
                title="Festgeld"
                subtext="Gesperrt bis Laufzeitende"
                badge="Eingeschränkt"
                badgeColor="bg-orange-100 text-orange-700"
                borderColor="border-l-red-400"
              />
            </div>

            <div className="rounded-xl border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 max-w-sm mx-auto w-full mb-5">
              <p className="font-body text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                💡 Je schneller du an dein Geld kommst, desto liquider ist die Anlage — das lernst du im nächsten Level.
              </p>
            </div>

            <div className="flex justify-end mt-auto">
              <button
                onClick={handleNext}
                className="font-body text-sm font-medium text-foreground border border-border rounded-full px-4 py-2 hover:bg-muted transition-colors"
              >
                Abschliessen ✓
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cash_F1_WhatIsCash;

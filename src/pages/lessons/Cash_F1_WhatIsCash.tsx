import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart } from "lucide-react";

const BLUE = "#1A56DB";

const Cash_F1_WhatIsCash = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts] = useState(3);
  const totalSteps = 3;
  const progress = (currentStep / (totalSteps - 1)) * 100;

  const handleNext = () => {
    if (currentStep >= totalSteps - 1) {
      navigate("/category/festgeld");
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/category/festgeld")}
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
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              className={`w-5 h-5 transition-all ${
                i < hearts ? "text-red-500 fill-red-500" : "text-muted-foreground/30"
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
            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-6 leading-tight">
              Du kennst ein Wasserglas?
            </h2>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full mb-6">
              <div className="bg-gray-100 rounded-2xl p-6 flex flex-col items-center gap-2">
                <span className="text-5xl">💧</span>
                <p className="font-semibold text-gray-800">Ein Wasserglas</p>
                <p className="text-sm text-gray-500 text-center">= sofort trinkbar</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-6 flex flex-col items-center gap-2 border border-blue-100">
                <span className="text-5xl">🏦</span>
                <p className="font-semibold text-gray-800">Geld auf dem Konto</p>
                <p className="text-sm text-blue-500 text-center font-medium">= sofort verfügbar</p>
              </div>
            </div>

            <p className="font-body text-sm text-muted-foreground text-center max-w-xs mx-auto mb-6">
              Geld auf dem Konto ist wie Wasser in einem Glas — immer sofort nutzbar.
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

        {/* ── Slide 2: Was gehört zu Cash? ── */}
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
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border-l-4 border-l-green-500 shadow-sm">
                <span className="text-3xl">💵</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Bargeld</p>
                  <p className="text-sm text-gray-500">Scheine und Münzen in deiner Tasche</p>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">Sofort verfügbar</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border-l-4 border-l-green-500 shadow-sm">
                <span className="text-3xl">🏦</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Girokonto</p>
                  <p className="text-sm text-gray-500">Dein alltägliches Bankkonto</p>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">Sofort verfügbar</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border-l-4 border-l-blue-400 shadow-sm">
                <span className="text-3xl">💰</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Tagesgeldkonto</p>
                  <p className="text-sm text-gray-500">Sparkonto mit täglicher Verfügbarkeit</p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Cash Equivalent</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border-l-4 border-l-blue-400 shadow-sm">
                <span className="text-3xl">📗</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Sparbuch</p>
                  <p className="text-sm text-gray-500">Klassische Sparform mit kleinen Zinsen</p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Cash Equivalent</span>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-l-yellow-400 rounded-xl p-4 max-w-sm mx-auto w-full mb-5">
              <p className="text-sm text-yellow-800">
                💡 Cash Equivalents sind fast so gut wie Cash — nur mit etwas mehr Zinsen.
              </p>
            </div>

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
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border-l-4 border-l-red-400 shadow-sm">
                <span className="text-3xl">📈</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Aktien</p>
                  <p className="text-sm text-gray-500">Wert schwankt täglich — nicht sofort sicher verfügbar</p>
                </div>
                <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full">Kein Cash</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border-l-4 border-l-red-400 shadow-sm">
                <span className="text-3xl">🏠</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Immobilie</p>
                  <p className="text-sm text-gray-500">Verkauf dauert Monate</p>
                </div>
                <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full">Kein Cash</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border-l-4 border-l-orange-400 shadow-sm">
                <span className="text-3xl">🔒</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Festgeld</p>
                  <p className="text-sm text-gray-500">Gesperrt bis Laufzeitende</p>
                </div>
                <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">Eingeschränkt</span>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-l-yellow-400 rounded-xl p-4 max-w-sm mx-auto w-full mb-5">
              <p className="text-sm text-yellow-800">
                💡 Je schneller du an dein Geld kommst, desto liquider ist die Anlage — das lernst du im nächsten Level.
              </p>
            </div>

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
      </AnimatePresence>
    </div>
  );
};

export default Cash_F1_WhatIsCash;

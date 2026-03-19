import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import StorySlide from './lessonSlides/StorySlide';
import PizzaSlide from './lessonSlides/PizzaSlide';
import ScaleSlide from './lessonSlides/ScaleSlide';
import RiskChartSlide from './lessonSlides/RiskChartSlide';
import TimeChartSlide from './lessonSlides/TimeChartSlide';
import CrashSlide from './lessonSlides/CrashSlide';
import DividendSlide from './lessonSlides/DividendSlide';
import QuizSlide from './lessonSlides/QuizSlide';
import CompletionSlide from './lessonSlides/CompletionSlide';
import CashSortSlide from './lessonSlides/CashSortSlide';
import { useProgressStore } from '@/hooks/useProgressStore';
import NoHeartsOverlay from '@/components/lessons/NoHeartsOverlay';
import CompletionXP from '@/components/lessons/CompletionXP';

const TOTAL_STEPS = 5;

interface LessonConfig {
  story: { emoji: string; title: string; mainText: string; secondaryText: string };
  interactionType: 'pizza' | 'scale' | 'riskChart' | 'timeChart' | 'crash' | 'dividend' | 'cashSort';
  quiz1: {
    label: string;
    question: string;
    answers: { id: string; text: string }[];
    correctId: string;
    correctFeedback: string;
    wrongFeedback: string;
  };
  quiz2: {
    label: string;
    question: string;
    answers: { id: string; text: string }[];
    correctId: string;
    correctFeedback: string;
    wrongFeedback: string;
  };
  completionSubtitle: string;
}

const lessonConfigs: Record<string, LessonConfig> = {
  f1: {
    story: {
      emoji: '💵',
      title: 'Cash ist König — aber was genau ist Cash?',
      mainText: 'Cash ist alles was du sofort ausgeben kannst — Bargeld in deiner Tasche, Geld auf deinem Konto, oder auf einem Sparbuch. Es ist die liquideste Form von Geld: immer verfügbar, immer sicher.',
      secondaryText: 'Cash Equivalents sind fast genauso sicher — kurzfristige Anlagen die du schnell in Cash umwandeln kannst, wie ein Tagesgeldkonto.',
    },
    interactionType: 'cashSort',
    quiz1: {
      label: 'Frage 1 von 2',
      question: 'Du brauchst morgen früh CHF 500 für eine dringende Reparatur. Welche Option hilft dir am schnellsten?',
      answers: [
        { id: 'a', text: 'Deine Aktien verkaufen' },
        { id: 'b', text: 'Deine Immobilie verkaufen' },
        { id: 'c', text: 'Geld vom Girokonto abheben' },
        { id: 'd', text: 'Festgeld vorzeitig auflösen' },
      ],
      correctId: 'c',
      correctFeedback: 'Richtig! Das Girokonto ist sofort verfügbar — kein Warten, keine Gebühren, kein Risiko.',
      wrongFeedback: 'Fast! Aktien, Immobilien und Festgeld brauchen Zeit oder haben Kosten. Cash auf dem Konto ist sofort da.',
    },
    quiz2: {
      label: 'Frage 2 von 2',
      question: 'Was unterscheidet Cash von einer Aktie?',
      answers: [
        { id: 'a', text: 'Cash bringt mehr Rendite als Aktien' },
        { id: 'b', text: 'Cash ist immer sofort verfügbar und verliert nicht plötzlich stark an Wert' },
        { id: 'c', text: 'Aktien sind sicherer als Cash' },
        { id: 'd', text: 'Es gibt keinen wesentlichen Unterschied' },
      ],
      correctId: 'b',
      correctFeedback: 'Genau! Cash ist stabil und sofort verfügbar — Aktien können stark schwanken und brauchen Zeit zum Verkaufen.',
      wrongFeedback: 'Nicht ganz — Cash glänzt nicht durch Rendite, sondern durch Sicherheit und sofortige Verfügbarkeit. Das ist sein grösster Vorteil.',
    },
    completionSubtitle: 'Du weisst jetzt was Cash und Cash Equivalents sind — und warum der Unterschied zu Aktien oder Immobilien im Alltag wichtig ist.',
  },
  a1: {
    story: {
      emoji: '🏢',
      title: 'Stell dir vor, du kaufst ein Stück deiner Lieblingsfirma',
      mainText: 'Wenn du eine Aktie kaufst, gehört dir ein kleines Stück eines Unternehmens. Steigt der Wert des Unternehmens, steigt auch deine Aktie — du profitierst direkt von seinem Erfolg.',
      secondaryText: 'Unternehmen verkaufen Aktien um Geld für Wachstum zu sammeln — statt einen Kredit aufzunehmen.',
    },
    interactionType: 'pizza',
    quiz1: {
      label: 'Frage 1 von 2',
      question: 'Was passiert wenn du eine Aktie kaufst?',
      answers: [
        { id: 'a', text: 'Du leihst der Firma Geld' },
        { id: 'b', text: 'Du wirst Miteigentümer der Firma' },
        { id: 'c', text: 'Du bekommst jeden Monat einen festen Betrag' },
        { id: 'd', text: 'Die Firma gehört dir komplett' },
      ],
      correctId: 'b',
      correctFeedback: 'Richtig! Als Aktionär bist du Miteigentümer — der Erfolg der Firma ist auch dein Erfolg.',
      wrongFeedback: 'Fast! Eine Aktie macht dich zum Miteigentümer — nicht zum Gläubiger oder Alleinbesitzer.',
    },
    quiz2: {
      label: 'Frage 2 von 2',
      question: 'Die Bewertung der AlphaFirma AG steigt dieses Jahr. Was passiert mit deiner Aktie?',
      answers: [
        { id: 'a', text: 'Nichts — das betrifft mich nicht' },
        { id: 'b', text: 'Sie wird mehr wert' },
        { id: 'c', text: 'Ich muss mehr dafür bezahlen' },
        { id: 'd', text: 'Die Aktie verschwindet' },
      ],
      correctId: 'b',
      correctFeedback: 'Genau! Die Bewertung der Firma steigt, dadurch steigt auch dein Anteil — du profitierst direkt als Miteigentümer.',
      wrongFeedback: 'Fast! Du bist Miteigentümer — ihr Gewinn ist auch dein Gewinn. Der Kurs steigt wenn die Firma gut läuft.',
    },
    completionSubtitle: 'Du weisst jetzt was eine Aktie ist und warum du damit Miteigentümer einer Firma wirst.',
  },
  a2: {
    story: {
      emoji: '📈',
      title: 'Dein Geld arbeitet für dich',
      mainText: 'Eine Rendite ist der Gewinn den du mit deiner Investition machst. Bei Aktien entsteht sie auf zwei Wegen: der Kurs der Aktie steigt — oder die Firma zahlt dir regelmässig einen Teil ihres Gewinns aus, genannt Dividende.',
      secondaryText: 'Langfristig haben Aktien historisch fast immer an Wert gewonnen — weil Unternehmen wachsen.',
    },
    interactionType: 'scale',
    quiz1: {
      label: 'Frage 1 von 2',
      question: 'Wie entsteht der Preis einer Aktie?',
      answers: [
        { id: 'a', text: 'Die Firma legt ihn fest' },
        { id: 'b', text: 'Die Regierung bestimmt ihn' },
        { id: 'c', text: 'Angebot und Nachfrage von Käufern und Verkäufern' },
        { id: 'd', text: 'Er bleibt immer gleich' },
      ],
      correctId: 'c',
      correctFeedback: 'Richtig! Millionen von Transaktionen jede Sekunde bestimmen den Kurs — niemand legt ihn alleine fest.',
      wrongFeedback: 'Nicht ganz — kein Einzelner bestimmt den Preis. Er entsteht durch das Zusammenspiel von Käufern und Verkäufern.',
    },
    quiz2: {
      label: 'Frage 2 von 2',
      question: 'Eine bekannte Firma kündigt ein revolutionäres neues Produkt an. Was passiert wohl mit dem Aktienkurs?',
      answers: [
        { id: 'a', text: 'Er fällt — die Firma hat Geld ausgegeben' },
        { id: 'b', text: 'Er bleibt gleich' },
        { id: 'c', text: 'Er steigt — mehr Leute wollen die Aktie kaufen' },
        { id: 'd', text: 'Die Börse schliesst' },
      ],
      correctId: 'c',
      correctFeedback: 'Genau! Gute Nachrichten erzeugen mehr Nachfrage — und mehr Nachfrage treibt den Preis hoch.',
      wrongFeedback: 'Fast! Gute Nachrichten bedeuten mehr Käufer. Mehr Käufer = höherer Preis. So reagiert die Börse täglich.',
    },
    completionSubtitle: 'Du verstehst jetzt wie Renditen entstehen und warum der Preis einer Aktie ständig schwankt.',
  },
  a3: {
    story: {
      emoji: '⚠️',
      title: 'Höhere Chance — aber auch höheres Risiko',
      mainText: 'Aktien können im Wert steigen — aber auch fallen. Diese Schwankungen nennt man Volatilität. Je grösser die mögliche Rendite, desto grösser ist meist auch das Risiko.',
      secondaryText: 'Eine junge Startup-Aktie kann sich verdoppeln oder auf null fallen. Eine grosse etablierte Firma schwankt viel ruhiger.',
    },
    interactionType: 'riskChart',
    quiz1: {
      label: 'Frage 1 von 2',
      question: 'Was bedeutet hohe Volatilität bei einer Aktie?',
      answers: [
        { id: 'a', text: 'Die Aktie steigt immer' },
        { id: 'b', text: 'Der Kurs schwankt stark — nach oben und unten' },
        { id: 'c', text: 'Die Aktie ist sehr sicher' },
        { id: 'd', text: 'Die Firma zahlt hohe Dividenden' },
      ],
      correctId: 'b',
      correctFeedback: 'Richtig! Volatilität bedeutet starke Schwankungen — das kann Chance oder Risiko sein, je nach Zeitpunkt.',
      wrongFeedback: 'Nicht ganz — Volatilität beschreibt wie stark ein Kurs schwankt, nicht ob er steigt oder fällt.',
    },
    quiz2: {
      label: 'Frage 2 von 2',
      question: 'Du brauchst dein Geld in genau 1 Jahr sicher zurück. Welche Aktie wählst du?',
      answers: [
        { id: 'a', text: 'RocketStartup AG — könnte sich verdoppeln' },
        { id: 'b', text: 'StableBank AG — ruhiger Verlauf' },
        { id: 'c', text: 'Beide je zur Hälfte' },
        { id: 'd', text: 'Lieber gar nichts investieren' },
      ],
      correctId: 'b',
      correctFeedback: 'Perfekt! Wenn du das Geld bald brauchst, ist Stabilität wichtiger als maximale Chance.',
      wrongFeedback: 'Vorsicht — RocketStartup könnte in einem Jahr bei -60% liegen. Hohes Risiko bedeutet auch hohes Verlustpotenzial.',
    },
    completionSubtitle: 'Du verstehst jetzt den Unterschied zwischen risikoreichen und stabilen Aktien.',
  },
  a4: {
    story: {
      emoji: '💰',
      title: 'Geld verdienen, nur durch Halten',
      mainText: 'Manche Unternehmen schütten einen Teil ihres Gewinns regelmässig an ihre Aktionäre aus — das nennt man Dividende. Du musst nichts verkaufen, nichts tun — einfach nur die Aktie halten und du bekommst automatisch Geld ausgezahlt.',
      secondaryText: 'Nicht alle Firmen zahlen Dividenden — grosse, etablierte Unternehmen tun es häufiger als junge Wachstumsfirmen.',
    },
    interactionType: 'dividend',
    quiz1: {
      label: 'Frage 1 von 2',
      question: 'Was ist eine Dividende?',
      answers: [
        { id: 'a', text: 'Ein Kredit den die Firma dir gibt' },
        { id: 'b', text: 'Ein Teil des Firmengewinns der an Aktionäre ausgezahlt wird' },
        { id: 'c', text: 'Der Preis den du für eine Aktie zahlst' },
        { id: 'd', text: 'Eine Strafe wenn der Kurs fällt' },
      ],
      correctId: 'b',
      correctFeedback: 'Richtig! Dividenden sind dein Anteil am Gewinn der Firma — einfach weil du Aktionär bist.',
      wrongFeedback: 'Fast! Eine Dividende ist keine Schuld und kein Preis — es ist dein Anteil am Gewinn der Firma, ausgezahlt nur weil du die Aktie hältst.',
    },
    quiz2: {
      label: 'Frage 2 von 2',
      question: 'Du hältst eine Aktie die 4% Dividende pro Jahr zahlt. Was musst du tun um die Dividende zu bekommen?',
      answers: [
        { id: 'a', text: 'Die Aktie zum richtigen Zeitpunkt verkaufen' },
        { id: 'b', text: 'Jeden Monat neu kaufen' },
        { id: 'c', text: 'Nichts — einfach die Aktie halten' },
        { id: 'd', text: 'Die Firma um Auszahlung bitten' },
      ],
      correctId: 'c',
      correctFeedback: 'Genau! Dividenden werden automatisch ausgezahlt — du musst nur Aktionär sein und die Aktie halten.',
      wrongFeedback: 'Fast! Du musst gar nichts tun — Dividenden werden automatisch an alle Aktionäre ausgezahlt, einfach durch das Halten der Aktie.',
    },
    completionSubtitle: 'Du weisst jetzt was Dividenden sind und wie passives Einkommen durch das einfache Halten von Aktien entsteht.',
  },
  a6: {
    story: {
      emoji: '⏳',
      title: 'Zeit ist dein grösster Vorteil',
      mainText: 'Aktien schwanken täglich — manchmal stark. Aber je länger du investiert bleibst, desto mehr gleichen sich diese Schwankungen aus. Historisch gesehen haben breit diversifizierte Portfolios über lange Zeiträume fast immer positive Renditen erzielt.',
      secondaryText: 'Zeit im Markt schlägt fast immer das Timing des Marktes.',
    },
    interactionType: 'timeChart',
    quiz1: {
      label: 'Frage 1 von 2',
      question: 'Was zeigt der AlphaIndex Chart über einen Zeitraum von 20 Jahren?',
      answers: [
        { id: 'a', text: 'Der Kurs ist immer gefallen' },
        { id: 'b', text: 'Der Kurs war immer stabil ohne Schwankungen' },
        { id: 'c', text: 'Trotz Crashes zeigt sich langfristig ein Aufwärtstrend' },
        { id: 'd', text: 'Es gab keine Veränderung' },
      ],
      correctId: 'c',
      correctFeedback: 'Genau! Kurzfristig ist die Börse unberechenbar — langfristig tendiert sie nach oben.',
      wrongFeedback: 'Schau nochmal auf den 20-Jahres-Chart — trotz starker Crashes zeigt sich ein klarer Aufwärtstrend.',
    },
    quiz2: {
      label: 'Frage 2 von 2',
      question: 'Der Markt crasht gerade um 30%. Du brauchst das Geld erst in 15 Jahren. Was machst du?',
      answers: [
        { id: 'a', text: 'Sofort alles verkaufen — bevor es schlimmer wird' },
        { id: 'b', text: 'Investiert bleiben und ruhig abwarten' },
        { id: 'c', text: 'Noch mehr kaufen auf Kredit' },
        { id: 'd', text: 'Alles in Gold umtauschen' },
      ],
      correctId: 'b',
      correctFeedback: 'Perfekt! Verluste werden erst real wenn du verkaufst. Mit 15 Jahren Horizont hat der Markt fast immer Zeit sich zu erholen.',
      wrongFeedback: 'Das ist der teuerste Fehler — Panikverkäufe realisieren den Verlust. Zeit ist dein grösster Vorteil als Anleger.',
    },
    completionSubtitle: 'Du weisst jetzt warum Geduld eine der wichtigsten Eigenschaften eines guten Investors ist.',
  },
  a5: {
    story: {
      emoji: '🥚',
      title: 'Nicht alles auf eine Karte setzen',
      mainText: 'Wenn du alles in eine einzige Aktie investierst, hängst du komplett von dieser einen Firma ab. Verteilst du dein Geld auf viele verschiedene Aktien aus verschiedenen Branchen, sinkt dein Risiko deutlich — weil sie nicht alle gleichzeitig fallen.',
      secondaryText: 'Diversifikation ist die einzige kostenlose Risikoreduzierung die es gibt.',
    },
    interactionType: 'crash',
    quiz1: {
      label: 'Frage 1 von 2',
      question: 'Warum schützt Diversifikation dein Portfolio?',
      answers: [
        { id: 'a', text: 'Weil du mehr Geld hast' },
        { id: 'b', text: 'Weil verschiedene Branchen nicht alle gleichzeitig fallen' },
        { id: 'c', text: 'Weil du mehr Dividenden bekommst' },
        { id: 'd', text: 'Weil der Markt dann stabiler wird' },
      ],
      correctId: 'b',
      correctFeedback: 'Richtig! Verschiedene Branchen reagieren unterschiedlich auf Krisen — das reduziert dein Gesamtrisiko.',
      wrongFeedback: 'Fast! Der Schlüssel ist dass verschiedene Branchen unabhängig voneinander reagieren — fällt eine, können andere stabil bleiben.',
    },
    quiz2: {
      label: 'Frage 2 von 2',
      question: 'Welches Portfolio übersteht einen Crash in der Technologiebranche am besten?',
      answers: [
        { id: 'a', text: '100% Apple-Aktien' },
        { id: 'b', text: '50% Apple, 50% Microsoft' },
        { id: 'c', text: 'Je 20% in Tech, Gesundheit, Energie, Konsum und Finanzen' },
        { id: 'd', text: 'Alle Aktien verkaufen und warten' },
      ],
      correctId: 'c',
      correctFeedback: 'Genau! Apple und Microsoft fallen gemeinsam wenn Tech crasht — echte Diversifikation bedeutet verschiedene Branchen.',
      wrongFeedback: 'Aufgepasst! Apple und Microsoft sind beide Tech-Aktien — sie fallen meist zusammen. Verschiedene Branchen sind der Schlüssel.',
    },
    completionSubtitle: 'Du weisst jetzt wie du dein Risiko durch Diversifikation deutlich reduzieren kannst — ohne auf Rendite verzichten zu müssen.',
  },
};

const LessonFlow = () => {
  const { categoryId, lessonId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);

  const config = lessonConfigs[lessonId ?? 'a1'] ?? lessonConfigs.a1;

  // Story and Completion slides allow immediate advance
  useEffect(() => {
    if (currentStep === 0 || currentStep === 4) {
      setCanAdvance(true);
    }
  }, [currentStep]);

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const goBack = () => navigate(`/category/${categoryId}`);
  const finishLesson = () => navigate(`/challenge/${categoryId}`, { state: { fromSubPage: true } });

  const handleNext = () => {
    if (!canAdvance) return;
    if (currentStep < TOTAL_STEPS - 1) {
      setCanAdvance(false);
      setCurrentStep(prev => prev + 1);
    } else {
      finishLesson();
    }
  };

  const renderInteraction = () => {
    if (config.interactionType === 'scale') {
      return <ScaleSlide key="scale" onComplete={() => setCanAdvance(true)} />;
    }
    if (config.interactionType === 'riskChart') {
      return <RiskChartSlide key="riskChart" onComplete={() => setCanAdvance(true)} />;
    }
    if (config.interactionType === 'timeChart') {
      return <TimeChartSlide key="timeChart" onComplete={() => setCanAdvance(true)} />;
    }
    if (config.interactionType === 'crash') {
      return <CrashSlide key="crash" onComplete={() => setCanAdvance(true)} />;
    }
    if (config.interactionType === 'dividend') {
      return <DividendSlide key="dividend" onComplete={() => setCanAdvance(true)} />;
    }
    if (config.interactionType === 'cashSort') {
      return <CashSortSlide key="cashSort" onComplete={() => setCanAdvance(true)} />;
    }
    return <PizzaSlide key="pizza" onComplete={() => setCanAdvance(true)} />;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-4 flex items-center gap-3">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {[0, 1, 2].map(i => (
            <Heart key={i} className="w-5 h-5 text-red-500 fill-red-500" />
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <StorySlide
            key="story"
            emoji={config.story.emoji}
            title={config.story.title}
            mainText={config.story.mainText}
            secondaryText={config.story.secondaryText}
          />
        )}
        {currentStep === 1 && renderInteraction()}
        {currentStep === 2 && (
          <QuizSlide
            key="quiz1"
            label={config.quiz1.label}
            question={config.quiz1.question}
            answers={config.quiz1.answers}
            correctId={config.quiz1.correctId}
            correctFeedback={config.quiz1.correctFeedback}
            wrongFeedback={config.quiz1.wrongFeedback}
            onAnswered={() => setCanAdvance(true)}
          />
        )}
        {currentStep === 3 && (
          <QuizSlide
            key="quiz2"
            label={config.quiz2.label}
            question={config.quiz2.question}
            answers={config.quiz2.answers}
            correctId={config.quiz2.correctId}
            correctFeedback={config.quiz2.correctFeedback}
            wrongFeedback={config.quiz2.wrongFeedback}
            onAnswered={() => setCanAdvance(true)}
          />
        )}
        {currentStep === 4 && (
          <CompletionSlide key="completion" subtitle={config.completionSubtitle} />
        )}
      </AnimatePresence>

      {/* CTA */}
      <div className="px-6 pb-8 max-w-sm mx-auto w-full">
        {!(currentStep === 1 && !canAdvance) && (
          <motion.button
            onClick={handleNext}
            disabled={!canAdvance}
            whileTap={canAdvance ? { scale: 0.96 } : undefined}
            className={`w-full h-14 rounded-full font-display text-lg font-bold transition-opacity ${
              canAdvance
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {currentStep < TOTAL_STEPS - 1 ? 'Weiter' : 'Abschließen'}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default LessonFlow;

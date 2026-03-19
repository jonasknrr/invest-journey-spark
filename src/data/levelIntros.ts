import {
  Vault,
  Coins,
  TrendUp,
  ChartBar,
  Stack,
  Certificate,
  CalendarBlank,
  ShieldCheck,
  Clock,
  Lightbulb,
  Warning,
  Percent,
  ArrowUp,
  ChartLineUp,
  Scales,
  CurrencyDollar,
} from '@phosphor-icons/react';

export interface IntroFact {
  icon: React.ElementType;
  label: string;
  text: string;
  color: string;
}

export interface LevelIntro {
  introTitle: string;
  introSubtitle: string;
  introText: string;
  introFacts: IntroFact[];
  introTip: string;
  accentColor: string;
  heroIcon: React.ElementType;
}

export const levelIntros: Record<string, LevelIntro> = {
  'chapter-1': {
    introTitle: 'Liquiditätsplanung',
    introSubtitle: 'Deine erste Simulation',
    introText:
      'Verteile 10.000 € auf Tagesgeld und Festgeld. Behalte deinen Notgroschen flexibel, sichere deine geplante Ausgabe und maximiere die Rendite für den Rest.',
    heroIcon: Vault,
    accentColor: 'var(--level-festgeld)',
    introFacts: [
      {
        icon: ShieldCheck,
        label: 'Notgroschen',
        text: '2.000 € müssen jederzeit sofort verfügbar sein — auf dem Tagesgeld.',
        color: 'hsl(var(--level-tagesgeld))',
      },
      {
        icon: CalendarBlank,
        label: 'Weiterbildung',
        text: 'In 2 Jahren brauchst du 3.000 € — das Geld muss rechtzeitig frei sein.',
        color: 'hsl(var(--level-aktien))',
      },
      {
        icon: Percent,
        label: 'Rendite',
        text: 'Das restliche Geld sollte möglichst hoch verzinst angelegt werden.',
        color: 'hsl(var(--level-waehrungen))',
      },
      {
        icon: Clock,
        label: 'Laufzeiten',
        text: 'Festgeld mit längerer Laufzeit bringt mehr Zinsen — aber du kommst nicht dran.',
        color: 'hsl(var(--level-krypto))',
      },
    ],
    introTip:
      'Tipp: Nicht alles auf Tagesgeld legen — das bringt wenig Zinsen. Nutze die unterschiedlichen Laufzeiten strategisch!',
  },
  festgeld: {
    introTitle: 'Was ist Festgeld?',
    introSubtitle: 'Dein sicherer Start ins Investieren',
    introText:
      'Bei Festgeld legst du dein Geld für einen festen Zeitraum bei einer Bank an. Dafür bekommst du einen garantierten Zinssatz – egal, was an den Märkten passiert.',
    heroIcon: Vault,
    accentColor: 'var(--level-festgeld)',
    introFacts: [
      {
        icon: ShieldCheck,
        label: 'Sicherheit',
        text: 'Dein Geld ist bis 100.000 € durch die Einlagensicherung geschützt.',
        color: 'hsl(var(--level-festgeld))',
      },
      {
        icon: CalendarBlank,
        label: 'Laufzeit',
        text: 'Du wählst, wie lange dein Geld angelegt wird – z. B. 6, 12 oder 24 Monate.',
        color: 'hsl(var(--level-aktien))',
      },
      {
        icon: Percent,
        label: 'Rendite',
        text: 'Die Zinsen sind fest vereinbart, aber meist niedriger als bei risikoreichen Anlagen.',
        color: 'hsl(var(--level-waehrungen))',
      },
      {
        icon: Clock,
        label: 'Flexibilität',
        text: 'Während der Laufzeit kommst du in der Regel nicht an dein Geld ran.',
        color: 'hsl(var(--level-krypto))',
      },
    ],
    introTip:
      'Festgeld eignet sich besonders gut, wenn du Geld hast, das du in den nächsten Monaten sicher nicht brauchst. Du bekommst dafür planbare Zinsen – ganz ohne Stress.',
  },
  tagesgeld: {
    introTitle: 'Was ist Tagesgeld?',
    introSubtitle: 'Flexibel und jederzeit verfügbar',
    introText:
      'Tagesgeld ist wie ein Sparkonto, auf das du jederzeit zugreifen kannst. Die Zinsen können sich ändern, aber dein Geld bleibt stets verfügbar.',
    heroIcon: Coins,
    accentColor: 'var(--level-tagesgeld)',
    introFacts: [
      {
        icon: ShieldCheck,
        label: 'Sicherheit',
        text: 'Ebenfalls durch die Einlagensicherung bis 100.000 € geschützt.',
        color: 'hsl(var(--level-festgeld))',
      },
      {
        icon: ArrowUp,
        label: 'Verfügbarkeit',
        text: 'Du kannst dein Geld jederzeit abheben – ohne Wartezeit.',
        color: 'hsl(var(--level-tagesgeld))',
      },
      {
        icon: Percent,
        label: 'Zinsen',
        text: 'Die Zinsen sind variabel und können sich jederzeit ändern.',
        color: 'hsl(var(--level-waehrungen))',
      },
      {
        icon: Lightbulb,
        label: 'Ideal für',
        text: 'Deinen Notgroschen oder Geld, das du bald brauchen könntest.',
        color: 'hsl(var(--level-krypto))',
      },
    ],
    introTip:
      'Tagesgeld ist perfekt für deinen Notgroschen – immer verfügbar, sicher und trotzdem mit kleinen Zinsen.',
  },
  aktien: {
    introTitle: 'Was sind Aktien?',
    introSubtitle: 'Werde Miteigentümer:in von Unternehmen',
    introText:
      'Wenn du eine Aktie kaufst, gehört dir ein kleines Stück eines Unternehmens. Steigt der Wert des Unternehmens, steigt auch deine Aktie.',
    heroIcon: TrendUp,
    accentColor: 'var(--level-aktien)',
    introFacts: [
      {
        icon: ChartLineUp,
        label: 'Renditechance',
        text: 'Aktien bieten langfristig die höchsten Renditechancen aller Anlageklassen.',
        color: 'hsl(var(--level-aktien))',
      },
      {
        icon: Warning,
        label: 'Risiko',
        text: 'Kurse schwanken – kurzfristig kannst du auch Verluste machen.',
        color: 'hsl(var(--destructive))',
      },
      {
        icon: CurrencyDollar,
        label: 'Dividenden',
        text: 'Manche Unternehmen schütten regelmäßig Gewinne an dich aus.',
        color: 'hsl(var(--level-festgeld))',
      },
      {
        icon: Clock,
        label: 'Zeithorizont',
        text: 'Am besten für Geld, das du 5+ Jahre nicht brauchst.',
        color: 'hsl(var(--level-krypto))',
      },
    ],
    introTip:
      'Aktien sind kein Sprint, sondern ein Marathon. Wer geduldig bleibt, wird langfristig meistens belohnt.',
  },
  anleihen: {
    introTitle: 'Was sind Anleihen?',
    introSubtitle: 'Geld verleihen, Zinsen kassieren',
    introText:
      'Mit einer Anleihe leihst du einem Staat oder Unternehmen Geld. Dafür bekommst du regelmäßig Zinsen und am Ende dein Geld zurück.',
    heroIcon: Certificate,
    accentColor: 'var(--level-anleihen)',
    introFacts: [
      {
        icon: Scales,
        label: 'Stabilität',
        text: 'Anleihen schwanken weniger als Aktien – besonders Staatsanleihen.',
        color: 'hsl(var(--level-anleihen))',
      },
      {
        icon: Percent,
        label: 'Feste Zinsen',
        text: 'Du weißt vorher, wie viel Zinsen du bekommst.',
        color: 'hsl(var(--level-waehrungen))',
      },
      {
        icon: Warning,
        label: 'Risiko',
        text: 'Bei Unternehmensanleihen besteht ein Ausfallrisiko.',
        color: 'hsl(var(--destructive))',
      },
      {
        icon: Lightbulb,
        label: 'Gut zu wissen',
        text: 'Anleihen und Aktien verhalten sich oft gegenläufig – ideal zur Absicherung.',
        color: 'hsl(var(--level-festgeld))',
      },
    ],
    introTip:
      'Anleihen sind wie ein ruhiger Anker in deinem Portfolio – weniger Rendite, aber auch weniger Überraschungen.',
  },
  waehrungen: {
    introTitle: 'Was sind Währungen?',
    introSubtitle: 'Die Welt des Geldes verstehen',
    introText:
      'Währungen wie Euro, Dollar oder Yen verändern ständig ihren Wert zueinander. Das hat Einfluss auf deine Investments – auch ohne dass du aktiv Währungen handelst.',
    heroIcon: ChartBar,
    accentColor: 'var(--level-waehrungen)',
    introFacts: [
      {
        icon: Scales,
        label: 'Wechselkurse',
        text: 'Der Kurs bestimmt, wie viel eine Währung in einer anderen wert ist.',
        color: 'hsl(var(--level-waehrungen))',
      },
      {
        icon: Warning,
        label: 'Inflation',
        text: 'Steigt die Inflation, verliert dein Geld an Kaufkraft.',
        color: 'hsl(var(--destructive))',
      },
      {
        icon: ChartLineUp,
        label: 'Einfluss',
        text: 'Währungsschwankungen beeinflussen auch deine Aktien und ETFs.',
        color: 'hsl(var(--level-aktien))',
      },
      {
        icon: Lightbulb,
        label: 'Tipp',
        text: 'Diversifikation über verschiedene Währungsräume kann Risiko senken.',
        color: 'hsl(var(--level-festgeld))',
      },
    ],
    introTip:
      'Du musst kein Währungstrader werden – aber zu verstehen, wie Währungen funktionieren, macht dich zu einer besseren Investor:in.',
  },
  krypto: {
    introTitle: 'Was sind Kryptowährungen?',
    introSubtitle: 'Digitales Neuland entdecken',
    introText:
      'Kryptowährungen wie Bitcoin sind digitale Zahlungsmittel, die auf Blockchain-Technologie basieren. Sie sind dezentral, volatil und faszinierend.',
    heroIcon: Stack,
    accentColor: 'var(--level-krypto)',
    introFacts: [
      {
        icon: ChartLineUp,
        label: 'Chance',
        text: 'Hohe Renditechancen – aber auch extreme Schwankungen.',
        color: 'hsl(var(--level-krypto))',
      },
      {
        icon: Warning,
        label: 'Risiko',
        text: 'Kurse können innerhalb weniger Tage stark fallen.',
        color: 'hsl(var(--destructive))',
      },
      {
        icon: ShieldCheck,
        label: 'Blockchain',
        text: 'Transaktionen werden dezentral und transparent gespeichert.',
        color: 'hsl(var(--level-aktien))',
      },
      {
        icon: Lightbulb,
        label: 'Für wen?',
        text: 'Nur für Geld, dessen Verlust du komplett verkraften kannst.',
        color: 'hsl(var(--level-waehrungen))',
      },
    ],
    introTip:
      'Krypto ist spannend, aber riskant. Investiere nur, was du bereit bist komplett zu verlieren – und lerne erst die Grundlagen.',
  },
};

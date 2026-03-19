export interface QuizAnswer {
  id: string;
  text: string;
}

export interface TopicConfig {
  slug: string;
  levelId: string;
  title: string;
  subtitle: string;
  iconName: string;
  iconColor: string;
  iconBgColor: string;
  explanation: {
    mainText: string;
    secondaryText: string;
  };
  visualKey: string;
  quiz: {
    question: string;
    answers: QuizAnswer[];
    correctId: string;
    correctFeedback: string;
    wrongFeedback: string;
  };
}

const aktienTopics: TopicConfig[] = [
  {
    slug: 'a1',
    levelId: 'aktien',
    title: 'Was sind Aktien?',
    subtitle: 'Werde Miteigentümer:in von Unternehmen',
    iconName: 'TrendUp',
    iconColor: 'hsl(215, 90%, 60%)',
    iconBgColor: 'hsl(var(--level-aktien) / 0.12)',
    explanation: {
      mainText:
        'Wenn du eine Aktie kaufst, gehört dir ein kleines Stück eines Unternehmens. Steigt der Wert des Unternehmens, steigt auch deine Aktie — du profitierst direkt von seinem Erfolg.',
      secondaryText:
        'Unternehmen verkaufen Aktien um Geld für Wachstum zu sammeln — statt einen Kredit aufzunehmen.',
    },
    visualKey: 'pizza',
    quiz: {
      question:
        'Die Bewertung der AlphaFirma AG steigt dieses Jahr. Was passiert mit deiner Aktie?',
      answers: [
        { id: 'a', text: 'Nichts — das betrifft mich nicht' },
        { id: 'b', text: 'Sie wird wahrscheinlich mehr wert' },
        { id: 'c', text: 'Ich muss mehr dafür bezahlen' },
        { id: 'd', text: 'Die Aktie verschwindet' },
      ],
      correctId: 'b',
      correctFeedback:
        'Richtig! Du bist Miteigentümer — wenn die Firma gewinnt, gewinnt dein Stück.',
      wrongFeedback:
        'Fast! Du bist Miteigentümer der Firma — ihr Erfolg ist auch dein Erfolg.',
    },
  },
  {
    slug: 'a2',
    levelId: 'aktien',
    title: 'Wie entstehen Renditen?',
    subtitle: 'Warum Aktien langfristig wachsen',
    iconName: 'TrendUp',
    iconColor: 'hsl(215, 90%, 60%)',
    iconBgColor: 'hsl(var(--level-aktien) / 0.12)',
    explanation: {
      mainText:
        'Eine Rendite ist der Gewinn den du mit deiner Investition machst. Bei Aktien entsteht sie auf zwei Wegen: der Kurs der Aktie steigt — oder die Firma zahlt dir regelmässig einen Teil ihres Gewinns aus, genannt Dividende.',
      secondaryText:
        'Langfristig haben Aktien historisch fast immer an Wert gewonnen — weil Unternehmen wachsen.',
    },
    visualKey: 'scale',
    quiz: {
      question:
        'Eine bekannte Firma kündigt ein revolutionäres neues Produkt an. Was passiert wohl mit dem Aktienkurs?',
      answers: [
        { id: 'a', text: 'Er fällt — die Firma hat Geld für Entwicklung ausgegeben' },
        { id: 'b', text: 'Er bleibt gleich — Produkte ändern nichts' },
        { id: 'c', text: 'Er steigt — mehr Leute wollen die Aktie kaufen' },
        { id: 'd', text: 'Die Börse schliesst vorübergehend' },
      ],
      correctId: 'c',
      correctFeedback:
        'Genau! Gute Nachrichten erzeugen mehr Nachfrage — und mehr Nachfrage treibt den Preis hoch.',
      wrongFeedback:
        'Fast! Gute Nachrichten bedeuten mehr Käufer. Mehr Käufer = höherer Preis. So reagiert die Börse täglich.',
    },
  },
  {
    slug: 'a3',
    levelId: 'aktien',
    title: 'Risiko und Volatilität',
    subtitle: 'Warum Schwankungen normal sind',
    iconName: 'Warning',
    iconColor: 'hsl(35, 95%, 50%)',
    iconBgColor: 'hsl(35, 95%, 55% / 0.12)',
    explanation: {
      mainText:
        'Aktien können im Wert steigen — aber auch fallen. Diese Schwankungen nennt man Volatilität. Je grösser die mögliche Rendite, desto grösser ist meist auch das Risiko. Das ist kein Fehler des Systems — es ist wie Aktien funktionieren.',
      secondaryText:
        'Eine junge Startup-Aktie kann sich verdoppeln oder auf null fallen. Eine grosse etablierte Firma schwankt viel ruhiger.',
    },
    visualKey: 'riskCharts',
    quiz: {
      question:
        'Du brauchst dein Geld in genau 1 Jahr sicher zurück. Welche Aktie wählst du?',
      answers: [
        { id: 'a', text: 'RocketStartup AG — könnte sich verdoppeln' },
        { id: 'b', text: 'StableBank AG — ruhiger Verlauf' },
        { id: 'c', text: 'Beide je zur Hälfte' },
        { id: 'd', text: 'Lieber gar nichts investieren' },
      ],
      correctId: 'b',
      correctFeedback:
        'Perfekt! Wenn du das Geld bald brauchst, ist Stabilität wichtiger als maximale Chance. RocketStartup könnte in einem Jahr auch -60% sein.',
      wrongFeedback:
        'Vorsicht — RocketStartup könnte in einem Jahr bei -60% liegen. Hohes Risiko bedeutet auch hohes Verlustpotenzial, besonders kurzfristig.',
    },
  },
  {
    slug: 'a5',
    levelId: 'aktien',
    title: 'Diversifikation',
    subtitle: 'Nicht alles auf eine Karte setzen',
    iconName: 'ChartPie',
    iconColor: 'hsl(var(--primary))',
    iconBgColor: 'hsl(var(--primary) / 0.12)',
    explanation: {
      mainText:
        'Wenn du alles in eine einzige Aktie investierst, hängst du komplett von dieser einen Firma ab. Verteilst du dein Geld auf viele verschiedene Aktien aus verschiedenen Branchen, sinkt dein Risiko deutlich — weil sie nicht alle gleichzeitig fallen.',
      secondaryText:
        'Diversifikation ist die einzige «kostenlose» Risikoreduzierung die es gibt.',
    },
    visualKey: 'crash',
    quiz: {
      question:
        'Welches Portfolio übersteht einen schweren Crash in der Technologiebranche am besten?',
      answers: [
        { id: 'a', text: '100% Apple-Aktien' },
        { id: 'b', text: '50% Apple, 50% Microsoft' },
        { id: 'c', text: 'Je 20% in Tech, Gesundheit, Energie, Konsum und Finanzen' },
        { id: 'd', text: 'Alle Aktien verkaufen und warten' },
      ],
      correctId: 'c',
      correctFeedback:
        'Genau! Apple und Microsoft fallen gemeinsam wenn Tech crasht — das ist keine echte Diversifikation. Verschiedene Branchen reagieren unterschiedlich auf Krisen.',
      wrongFeedback:
        'Aufgepasst! Apple und Microsoft sind beide Tech-Aktien — sie fallen meist gemeinsam. Echte Diversifikation bedeutet verschiedene Branchen, nicht nur verschiedene Firmennamen.',
    },
  },
  {
    slug: 'a6',
    levelId: 'aktien',
    title: 'Zeitraum & Geduld',
    subtitle: 'Dein grösster Vorteil als Anleger',
    iconName: 'Clock',
    iconColor: 'hsl(var(--primary))',
    iconBgColor: 'hsl(var(--primary) / 0.12)',
    explanation: {
      mainText:
        'Aktien schwanken täglich — manchmal stark. Aber je länger du investiert bleibst, desto mehr gleichen sich diese Schwankungen aus. Historisch gesehen haben breit diversifizierte Portfolios über lange Zeiträume fast immer positive Renditen erzielt.',
      secondaryText:
        'Zeit im Markt schlägt fast immer das Timing des Marktes.',
    },
    visualKey: 'timeChart',
    quiz: {
      question:
        'Der Markt crasht gerade um 30%. Du brauchst das Geld erst in 15 Jahren. Was machst du?',
      answers: [
        { id: 'a', text: 'Sofort alles verkaufen — bevor es noch schlimmer wird' },
        { id: 'b', text: 'Investiert bleiben und ruhig abwarten' },
        { id: 'c', text: 'Noch mehr kaufen auf Kredit' },
        { id: 'd', text: 'Alles in Gold umtauschen' },
      ],
      correctId: 'b',
      correctFeedback:
        'Perfekt! Verluste werden erst real wenn du verkaufst. Wer langfristig denkt und bleibt, erholt sich mit dem Markt — das zeigt die Geschichte immer wieder.',
      wrongFeedback:
        'Das ist der teuerste Fehler den Anleger machen — Panikverkäufe realisieren den Verlust. Mit 15 Jahren Horizont hat der Markt fast immer Zeit sich zu erholen.',
    },
  },
];

export const topicsByLevel: Record<string, TopicConfig[]> = {
  aktien: aktienTopics,
};

export function getTopic(levelId: string, slug: string): TopicConfig | undefined {
  return topicsByLevel[levelId]?.find((t) => t.slug === slug);
}

export function getTopicsForLevel(levelId: string): TopicConfig[] {
  return topicsByLevel[levelId] ?? [];
}

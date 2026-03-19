export type LevelStatus = 'completed' | 'current' | 'locked';
export type SubLevelStatus = 'completed' | 'current' | 'locked';

export interface SubLevel {
  id: string;
  title: string;
  description: string;
  status: SubLevelStatus;
  duration: string;
}

export interface Level {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  colorKey: string;
  colorVar: string;
  status: LevelStatus;
  progress: number;
  subLevels: SubLevel[];
}

export const levels: Level[] = [
  {
    id: 'festgeld',
    title: 'Cash & Cash Equivalents',
    subtitle: 'Dein sicherer Start',
    iconName: 'Vault',
    colorKey: 'festgeld',
    colorVar: '--level-festgeld',
    status: 'current',
    progress: 0,
    subLevels: [
      { id: 'f1', title: 'Was ist Cash?', description: 'Bargeld, Sparbuch & Co. erklärt', status: 'current', duration: '3 Min' },
      { id: 'f2', title: 'Was ist Inflation?', description: 'Warum dein Geld weniger wird', status: 'current', duration: '3 Min' },
      { id: 'f3', title: 'Was ist Liquidität?', description: 'Warum Verfügbarkeit zählt', status: 'current', duration: '2 Min' },
      { id: 'f4', title: 'Was ist Tagesgeld?', description: 'Flexibel sparen mit Rendite', status: 'current', duration: '3 Min' },
      { id: 'f5', title: 'Was ist Festgeld?', description: 'Mehr Zins, weniger Flexibilität', status: 'current', duration: '3 Min' },
    ],
  },
  {
    id: 'aktien',
    title: 'Aktien',
    subtitle: 'Miteigentümer werden',
    iconName: 'RocketLaunch',
    colorKey: 'aktien',
    colorVar: '--level-aktien',
    status: 'current',
    progress: 42,
    subLevels: [
      { id: 'a1', title: 'Was sind Aktien?', description: 'Stell dir vor, du kaufst ein Stück deiner Lieblingsfirma', status: 'completed', duration: '3 Min' },
      { id: 'a2', title: 'Wie wird der Aktienpreis bestimmt?', description: 'Warum Aktien langfristig wachsen', status: 'completed', duration: '4 Min' },
      { id: 'a3', title: 'Risiko und Volatilität', description: 'Warum Schwankungen normal sind', status: 'completed', duration: '3 Min' },
      { id: 'a4', title: 'Dividenden', description: 'Geld verdienen, nur durch Halten', status: 'completed', duration: '3 Min' },
      { id: 'a5', title: 'Diversifikation', description: 'Der smarte Weg zum breiten Markt', status: 'completed', duration: '4 Min' },
      { id: 'a6', title: 'Langfristiges Denken', description: 'Zeit ist dein bester Freund', status: 'completed', duration: '3 Min' },
      { id: 'a7', title: 'Häufige Anfängerfehler', description: 'Lerne aus den Fehlern anderer', status: 'current', duration: '4 Min' },
    ],
  },
  {
    id: 'etfs',
    title: 'ETFs & Indexe',
    subtitle: 'Smarter investieren',
    iconName: 'ChartLineUp',
    colorKey: 'etfs',
    colorVar: '--level-etfs',
    status: 'current',
    progress: 0,
    subLevels: [
      { id: 'e1', title: 'What is an index?', description: 'The market\'s scoreboard', status: 'current', duration: '4 Min' },
      { id: 'e2', title: 'How indexes are built', description: 'Why size matters', status: 'current', duration: '5 Min' },
      { id: 'e3', title: 'What is an ETF?', description: 'The investable wrapper', status: 'current', duration: '5 Min' },
      { id: 'e4', title: 'The ETF universe', description: 'Broad, sector, theme & factor', status: 'current', duration: '6 Min' },
      { id: 'e5', title: 'Costs & key numbers', description: 'The silent fee', status: 'current', duration: '6 Min' },
      { id: 'e6', title: 'Risk & diversification', description: 'What an ETF can\'t protect', status: 'current', duration: '6 Min' },
      { id: 'e7', title: 'Acc vs Dist & tax', description: 'Snowball or paycheck?', status: 'current', duration: '5 Min' },
      { id: 'e8', title: 'Der ETF-Sparplan', description: 'Wie €100/Monat zu einem Vermögen werden', status: 'current', duration: '5 Min' },
      { id: 'e9', title: 'Finale Simulation', description: 'Wende alles an', status: 'current', duration: '10 Min' },
    ],
  },
  {
    id: 'anleihen',
    title: 'Anleihen',
    subtitle: 'Geld verleihen, Zinsen kassieren',
    iconName: 'Ticket',
    colorKey: 'anleihen',
    colorVar: '--level-anleihen',
    status: 'locked',
    progress: 0,
    subLevels: [
      { id: 'an1', title: 'Was sind Anleihen?', description: 'Du wirst zum Kreditgeber', status: 'locked', duration: '3 Min' },
      { id: 'an2', title: 'Staats- vs. Unternehmensanleihen', description: 'Wem vertraust du dein Geld an?', status: 'locked', duration: '3 Min' },
      { id: 'an3', title: 'Zinsen und Kurse', description: 'Wie sich Anleihen im Markt bewegen', status: 'locked', duration: '4 Min' },
    ],
  },
  {
    id: 'waehrungen',
    title: 'Währungen',
    subtitle: 'Die Welt des Geldes',
    iconName: 'Compass',
    colorKey: 'waehrungen',
    colorVar: '--level-waehrungen',
    status: 'locked',
    progress: 0,
    subLevels: [
      { id: 'w1', title: 'Was sind Wechselkurse?', description: 'Warum der Dollar mal mehr, mal weniger wert ist', status: 'locked', duration: '3 Min' },
      { id: 'w2', title: 'Inflation verstehen', description: 'Warum dein Geld an Wert verliert', status: 'locked', duration: '3 Min' },
    ],
  },
  {
    id: 'krypto',
    title: 'Kryptowährungen',
    subtitle: 'Digitales Neuland',
    iconName: 'Globe',
    colorKey: 'krypto',
    colorVar: '--level-krypto',
    status: 'locked',
    progress: 0,
    subLevels: [
      { id: 'k1', title: 'Was ist Bitcoin?', description: 'Die erste digitale Währung', status: 'locked', duration: '4 Min' },
      { id: 'k2', title: 'Blockchain einfach erklärt', description: 'Die Technologie dahinter', status: 'locked', duration: '3 Min' },
    ],
  },
  {
    id: 'gold',
    title: 'Gold',
    subtitle: 'Der sichere Hafen',
    iconName: 'Diamond',
    colorKey: 'gold',
    colorVar: '--level-gold',
    status: 'locked',
    progress: 0,
    subLevels: [
      { id: 'g1', title: 'Warum Gold?', description: 'Das älteste Wertaufbewahrungsmittel', status: 'locked', duration: '3 Min' },
      { id: 'g2', title: 'Physisch vs. digital', description: 'Barren im Tresor oder ETF im Depot?', status: 'locked', duration: '3 Min' },
    ],
  },
  {
    id: 'immobilien',
    title: 'Immobilien',
    subtitle: 'Betongold verstehen',
    iconName: 'House',
    colorKey: 'immobilien',
    colorVar: '--level-immobilien',
    status: 'locked',
    progress: 0,
    subLevels: [
      { id: 'i1', title: 'Mieten vs. Kaufen', description: 'Was lohnt sich wirklich?', status: 'locked', duration: '4 Min' },
      { id: 'i2', title: 'REITs entdecken', description: 'Immobilien ohne Haus', status: 'locked', duration: '3 Min' },
    ],
  },
];

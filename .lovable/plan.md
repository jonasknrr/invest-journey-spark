

## Plan: Translate Entire App from German to English

### Scope

This is a text-only change across ~35 files. No code logic, styles, or structure changes. Every visible German string gets replaced with its English equivalent.

### Files to Edit (grouped by area)

**1. Data Files (5 files)**
- `src/data/levels.ts` — All level titles, subtitles, subLevel titles/descriptions
- `src/data/topicConfig.ts` — All Aktien topic titles, subtitles, explanations, quiz questions/answers/feedback
- `src/data/challengeConfig.ts` — Chapter labels, scenario titles/descriptions
- `src/data/levelIntros.ts` — All intro titles, subtitles, texts, fact labels/texts, tips
- `src/data/festgeldProducts.ts` — Product titles ("1 Jahr Festgeld" → "1 Year Fixed Deposit")
- `src/data/tagesgeldProducts.ts` — "Tagesgeld" → "Call Money"
- `src/hooks/useDiversification.ts` — Rating labels ("Sehr gut" → "Very Good", "Gut" → "Good", etc.)

**2. Onboarding & Header (2 files)**
- `src/pages/Onboarding.tsx` — Welcome text, feature cards, name input label, CTA button
- `src/pages/LearningPath.tsx` — Header labels ("Tage", "Gesamtfortschritt", "geschafft"), chapter short names

**3. Learning Path Components (3 files)**
- `src/components/LevelNode.tsx` — "Wird freigeschaltet" → "Unlocks soon"
- `src/components/LevelIntroOverlay.tsx` — "Merke dir", "Verstanden, los geht's!", aria-label
- `src/pages/CategoryDetail.tsx` — "Lektionen", "abgeschlossen", "Starten", "Simulationsaufgabe"

**4. Lesson Start (1 file)**
- `src/pages/LessonStart.tsx` — Bullet texts, "Lektion beginnen"

**5. Shared Lesson Components (5 files)**
- `src/components/lessons/LessonShared.tsx` — "Lektion abgeschlossen!", "Weiter lernen"
- `src/components/lessons/ExplanationStep.tsx` — "Weiter" button
- `src/components/lessons/QuizStep.tsx` — "Kurze Frage", "Lektion abschliessen"
- `src/components/lessons/CompletionXP.tsx` — "verdient", "Perfekt abgeschlossen!", "bereits abgeschlossen"
- `src/components/lessons/NoHeartsOverlay.tsx` — "Keine Herzen mehr", restart options
- `src/components/lessons/CashSortGame.tsx` — Card labels, bucket labels ("Kein Cash"), sort instruction, success text

**6. Cash Lessons (5 files)**
- `src/pages/lessons/Cash_F1_WhatIsCash.tsx` — All slides, quizzes, completion text
- `src/pages/lessons/Cash_F2_Inflation.tsx` — All slides, quizzes, product names, completion text
- `src/pages/lessons/Cash_F3_Liquidity.tsx` — All slides, drag items, tier labels, quizzes, completion
- `src/pages/lessons/Cash_F4_Festgeld.tsx` — All slides, calculator labels, quizzes, completion
- `src/pages/lessons/Cash_F5_Tagesgeld.tsx` — All slides, pillar labels, quizzes, completion

**7. Completion Slide (1 file)**
- `src/pages/lessonSlides/CompletionSlide.tsx` — Default subtitle, "Lektion abgeschlossen!"

**8. Challenge & Simulation Pages (2 files)**
- `src/pages/LevelChallenge.tsx` — Asset class names, all labels ("Zurück", "Anlageklassen", "verfügbar", "Simulation starten", "Dein Budget", "Notgroschen", "Ziel", locked tooltip text)
- `src/pages/PortfolioSimulation.tsx` — All labels (Portfolio-Simulation, Portfoliowert, Lade Kursdaten, Challenge-Auswertung, all star labels/feedback, Deine Aufteilung, Performance, Endwert, Investiert, Rendite, Fälligkeits-Struktur, Aktien-Aufteilung, Risiko & Stabilität, Diversifikation, Volatilität labels, KI-Analyse, all weakness/coach texts, empty state, back button)

**9. Investment Detail Pages (6 files)**
- `src/pages/TagesgeldOverview.tsx` — All labels
- `src/pages/TagesgeldDetail.tsx` — All labels
- `src/pages/FestgeldOverview.tsx` — All labels
- `src/pages/FestgeldDetail.tsx` — All labels
- `src/pages/AktienOverview.tsx` — All labels
- `src/pages/AktienDetail.tsx` — All labels
- `src/pages/EtfOverview.tsx` — All labels
- `src/pages/EtfDetail.tsx` — All labels

**10. ETF Lessons (9 files)** — Check all for remaining German strings (some are already English but have German UI chrome like "Weiter →", "Lektion abgeschlossen", "Zur nächsten Lektion")

### Key Translation Decisions

| German | English |
|---|---|
| Tagesgeld | Call Money |
| Festgeld | Fixed Deposit |
| Aktien | Stocks |
| Anleihen | Bonds |
| Währungen | Currencies |
| Kryptowährungen | Cryptocurrencies |
| Immobilien | Real Estate |
| Notgroschen | Emergency fund |
| Lektion abgeschlossen | Lesson complete |
| Weiter | Continue |
| Zurück | Back |
| Frage X von Y | Question X of Y |
| Starten | Start |
| Sehr gut/Gut/Ausreichend/Mangelhaft/Schlecht | Very Good/Good/Fair/Poor/Bad |
| Kein Cash | No Cash |
| Wird freigeschaltet | Unlocks soon |
| Laufzeit | Term |
| Jahr/Jahre | Year/Years |
| Zinsen | Interest |
| Rendite | Return |
| Verfügbar | Available |
| Budget überschritten | Budget exceeded |
| Betrag eingeben | Enter amount |
| Betrag anpassen | Adjust amount |
| Investment entfernen | Remove investment |

### Approach

Edit all files in parallel batches since no file depends on another for text changes. The diversification rating translation (`Sehr gut` → `Very Good` etc.) needs to be consistent across `useDiversification.ts` and `PortfolioSimulation.tsx` where it's referenced.


/**
 * Edinburgh Postnatal Depression Scale (EPDS) — the validated 10-item screen.
 *
 * IMPORTANT (safeguarding): this is a screening aid, NOT a diagnosis. Each item
 * has four responses scored 0–3; some items are reverse-scored, so scores are
 * encoded explicitly per option rather than by position. Question 10 asks about
 * self-harm — ANY non-zero answer must surface crisis support regardless of the
 * total score.
 */

export type EpdsOption = { label: string; score: 0 | 1 | 2 | 3 };
export type EpdsQuestion = { prompt: string; options: EpdsOption[] };

export const EPDS_QUESTIONS: EpdsQuestion[] = [
  {
    prompt: 'I have been able to laugh and see the funny side of things',
    options: [
      { label: 'As much as I always could', score: 0 },
      { label: 'Not quite so much now', score: 1 },
      { label: 'Definitely not so much now', score: 2 },
      { label: 'Not at all', score: 3 },
    ],
  },
  {
    prompt: 'I have looked forward with enjoyment to things',
    options: [
      { label: 'As much as I ever did', score: 0 },
      { label: 'Rather less than I used to', score: 1 },
      { label: 'Definitely less than I used to', score: 2 },
      { label: 'Hardly at all', score: 3 },
    ],
  },
  {
    prompt: 'I have blamed myself unnecessarily when things went wrong',
    options: [
      { label: 'Yes, most of the time', score: 3 },
      { label: 'Yes, some of the time', score: 2 },
      { label: 'Not very often', score: 1 },
      { label: 'No, never', score: 0 },
    ],
  },
  {
    prompt: 'I have been anxious or worried for no good reason',
    options: [
      { label: 'No, not at all', score: 0 },
      { label: 'Hardly ever', score: 1 },
      { label: 'Yes, sometimes', score: 2 },
      { label: 'Yes, very often', score: 3 },
    ],
  },
  {
    prompt: 'I have felt scared or panicky for no very good reason',
    options: [
      { label: 'Yes, quite a lot', score: 3 },
      { label: 'Yes, sometimes', score: 2 },
      { label: 'No, not much', score: 1 },
      { label: 'No, not at all', score: 0 },
    ],
  },
  {
    prompt: 'Things have been getting on top of me',
    options: [
      { label: "Yes, most of the time I haven't been able to cope at all", score: 3 },
      { label: "Yes, sometimes I haven't been coping as well as usual", score: 2 },
      { label: 'No, most of the time I have coped quite well', score: 1 },
      { label: 'No, I have been coping as well as ever', score: 0 },
    ],
  },
  {
    prompt: 'I have been so unhappy that I have had difficulty sleeping',
    options: [
      { label: 'Yes, most of the time', score: 3 },
      { label: 'Yes, sometimes', score: 2 },
      { label: 'Not very often', score: 1 },
      { label: 'No, not at all', score: 0 },
    ],
  },
  {
    prompt: 'I have felt sad or miserable',
    options: [
      { label: 'Yes, most of the time', score: 3 },
      { label: 'Yes, quite often', score: 2 },
      { label: 'Not very often', score: 1 },
      { label: 'No, not at all', score: 0 },
    ],
  },
  {
    prompt: 'I have been so unhappy that I have been crying',
    options: [
      { label: 'Yes, most of the time', score: 3 },
      { label: 'Yes, quite often', score: 2 },
      { label: 'Only occasionally', score: 1 },
      { label: 'No, never', score: 0 },
    ],
  },
  {
    prompt: 'The thought of harming myself has occurred to me',
    options: [
      { label: 'Yes, quite often', score: 3 },
      { label: 'Sometimes', score: 2 },
      { label: 'Hardly ever', score: 1 },
      { label: 'Never', score: 0 },
    ],
  },
];

export type EpdsBand = 'low' | 'possible' | 'likely';

export function epdsBand(total: number): EpdsBand {
  if (total >= 13) return 'likely';
  if (total >= 10) return 'possible';
  return 'low';
}

export const BAND_LABEL: Record<EpdsBand, string> = {
  low: 'Low likelihood',
  possible: 'Possible depression',
  likely: 'Likely depression',
};

/** Score a set of answers (option index per question). Returns total + safeguard flag. */
export function scoreEpds(answers: number[]): { total: number; band: EpdsBand; selfHarmFlag: boolean } {
  let total = 0;
  answers.forEach((opt, q) => { total += EPDS_QUESTIONS[q].options[opt]?.score ?? 0; });
  const q10 = EPDS_QUESTIONS[9].options[answers[9]]?.score ?? 0;
  return { total, band: epdsBand(total), selfHarmFlag: q10 > 0 };
}

/** Crisis support shown when the safeguard flag fires or on the likely band. */
export const CRISIS_RESOURCES = [
  { name: 'Emergency services', detail: 'If you are in immediate danger, call your local emergency number (112 / 999 / 911).' },
  { name: 'Samaritans (UK & Ireland)', detail: 'Call 116 123, any time, free.' },
  { name: 'Postpartum Support International', detail: 'Call or text the PSI HelpLine: 1-800-944-4773.' },
];

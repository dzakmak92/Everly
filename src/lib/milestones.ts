/**
 * Curated milestone template — the moments most families want to capture, from
 * pregnancy through the early school years. Used by the Timeline to suggest
 * "tap-to-capture" moments so a child's story is never a blank page.
 *
 * `ageDays` is the approximate age (in days from birth) when the moment happens
 * — negative for pregnancy — and is used both to order suggestions and to
 * pre-fill a sensible default date (birthDate + ageDays).
 */
export type MilestoneStage = 'Pregnancy' | 'Birth & first days' | 'First year' | 'Toddler & childhood';

export type MilestoneTemplate = {
  key: string;
  title: string;
  emoji: string;
  stage: MilestoneStage;
  ageDays: number;
  hint: string;
};

export const MILESTONE_STAGES: MilestoneStage[] = ['Pregnancy', 'Birth & first days', 'First year', 'Toddler & childhood'];

export const MILESTONE_TEMPLATE: MilestoneTemplate[] = [
  // ── Pregnancy ──
  { key: 'expecting', title: "We're expecting!", emoji: '💗', stage: 'Pregnancy', ageDays: -260, hint: 'The day you found out' },
  { key: 'heartbeat', title: 'First heartbeat', emoji: '🫀', stage: 'Pregnancy', ageDays: -224, hint: '~8-week scan' },
  { key: 'scan12', title: '12-week scan', emoji: '📷', stage: 'Pregnancy', ageDays: -196, hint: '12 weeks' },
  { key: 'kicks', title: 'First kicks', emoji: '👣', stage: 'Pregnancy', ageDays: -140, hint: '~18–22 weeks' },
  { key: 'anomaly', title: '20-week scan', emoji: '🩻', stage: 'Pregnancy', ageDays: -140, hint: '20 weeks' },
  { key: 'shower', title: 'Baby shower', emoji: '🎈', stage: 'Pregnancy', ageDays: -45, hint: 'Third trimester' },
  // ── Birth & first days ──
  { key: 'birth', title: 'The big day', emoji: '🎉', stage: 'Birth & first days', ageDays: 0, hint: 'Birth · weight & length' },
  { key: 'firstphoto', title: 'First photo', emoji: '📸', stage: 'Birth & first days', ageDays: 0, hint: 'First minutes' },
  { key: 'cuddle', title: 'First cuddle', emoji: '🤱', stage: 'Birth & first days', ageDays: 0, hint: 'Skin-to-skin' },
  { key: 'feed', title: 'First feed', emoji: '🍼', stage: 'Birth & first days', ageDays: 0, hint: 'First feed' },
  { key: 'home', title: 'Coming home', emoji: '🏡', stage: 'Birth & first days', ageDays: 3, hint: 'First day home' },
  { key: 'meet', title: 'Meeting the family', emoji: '👵', stage: 'Birth & first days', ageDays: 5, hint: 'Siblings & grandparents' },
  // ── First year ──
  { key: 'bath', title: 'First bath', emoji: '🛁', stage: 'First year', ageDays: 14, hint: 'First weeks' },
  { key: 'smile', title: 'First smile', emoji: '😊', stage: 'First year', ageDays: 42, hint: '~6 weeks' },
  { key: 'head', title: 'Holds head up', emoji: '🙆', stage: 'First year', ageDays: 90, hint: '~3 months' },
  { key: 'laugh', title: 'First laugh', emoji: '😄', stage: 'First year', ageDays: 105, hint: '~3–4 months' },
  { key: 'roll', title: 'Rolls over', emoji: '🔄', stage: 'First year', ageDays: 120, hint: '~4 months' },
  { key: 'sit', title: 'Sits up', emoji: '🪑', stage: 'First year', ageDays: 180, hint: '~6 months' },
  { key: 'food', title: 'First taste of food', emoji: '🍽️', stage: 'First year', ageDays: 183, hint: '~6 months' },
  { key: 'tooth', title: 'First tooth', emoji: '🦷', stage: 'First year', ageDays: 190, hint: '~6 months' },
  { key: 'crawl', title: 'Crawling', emoji: '🐛', stage: 'First year', ageDays: 270, hint: '~9 months' },
  { key: 'stand', title: 'Pulls to stand', emoji: '🧍', stage: 'First year', ageDays: 300, hint: '~10 months' },
  { key: 'holiday', title: 'First holiday', emoji: '🏖️', stage: 'First year', ageDays: 300, hint: 'First trip away' },
  { key: 'word', title: 'First word', emoji: '🗣️', stage: 'First year', ageDays: 350, hint: '~10–14 months' },
  { key: 'steps', title: 'First steps', emoji: '🦶', stage: 'First year', ageDays: 365, hint: '~12 months' },
  { key: 'bday1', title: 'First birthday', emoji: '🎂', stage: 'First year', ageDays: 365, hint: 'at 1 year' },
  { key: 'haircut', title: 'First haircut', emoji: '💇', stage: 'First year', ageDays: 400, hint: 'First snip' },
  // ── Toddler & childhood ──
  { key: 'sentence', title: 'First sentence', emoji: '💬', stage: 'Toddler & childhood', ageDays: 640, hint: '~18–24 months' },
  { key: 'nursery', title: 'First day at nursery', emoji: '🎒', stage: 'Toddler & childhood', ageDays: 730, hint: '~2 years' },
  { key: 'draw', title: 'First drawing', emoji: '🖍️', stage: 'Toddler & childhood', ageDays: 760, hint: 'Early scribbles' },
  { key: 'potty', title: 'Potty trained', emoji: '🚽', stage: 'Toddler & childhood', ageDays: 900, hint: '~2–3 years' },
  { key: 'dummy', title: 'Bye-bye dummy', emoji: '👋', stage: 'Toddler & childhood', ageDays: 900, hint: 'A big step' },
  { key: 'balancebike', title: 'Rides a balance bike', emoji: '🛴', stage: 'Toddler & childhood', ageDays: 1095, hint: '~3 years' },
  { key: 'bff', title: 'Best friend', emoji: '🧑‍🤝‍🧑', stage: 'Toddler & childhood', ageDays: 1200, hint: 'First close friend' },
  { key: 'school', title: 'First day of school', emoji: '🏫', stage: 'Toddler & childhood', ageDays: 1642, hint: '~4–5 years' },
  { key: 'swim', title: 'Learns to swim', emoji: '🏊', stage: 'Toddler & childhood', ageDays: 1825, hint: '~5 years' },
  { key: 'ride', title: 'Rides a bike', emoji: '🚴', stage: 'Toddler & childhood', ageDays: 1825, hint: 'No stabilisers!' },
  { key: 'toothloss', title: 'Loses first tooth', emoji: '🦷', stage: 'Toddler & childhood', ageDays: 2190, hint: '~6 years' },
];

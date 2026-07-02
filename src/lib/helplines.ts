/**
 * Localised support helplines, keyed to the user's chosen city/country.
 *
 * Everything here is static and offline — the country code comes from the
 * weather location the user already picked, so nothing extra leaves the device.
 * Numbers are maternal-/mental-health and emergency lines; the international
 * set is the fallback when we don't have a country-specific list.
 */
export type Helpline = { name: string; detail: string; tel?: string };

const INTERNATIONAL: Helpline[] = [
  { name: 'Emergency services', detail: 'Local emergency number (112 / 999 / 911)' },
  { name: 'Postpartum Support Intl', detail: 'Call or text 1-800-944-4773', tel: '18009444773' },
];

const BY_COUNTRY: Record<string, Helpline[]> = {
  AT: [
    { name: 'Telefonseelsorge', detail: '142 · free, 24/7', tel: '142' },
    { name: 'Emergency', detail: '112 / 144', tel: '112' },
  ],
  DE: [
    { name: 'Telefonseelsorge', detail: '0800 111 0 111 · free, 24/7', tel: '08001110111' },
    { name: 'Schwangerschaft in Not', detail: '0800 40 40 020', tel: '080040400020' },
    { name: 'Emergency', detail: '112', tel: '112' },
  ],
  GB: [
    { name: 'Samaritans', detail: '116 123 · free, 24/7', tel: '116123' },
    { name: 'PANDAS (perinatal)', detail: '0808 1961 776', tel: '08081961776' },
    { name: 'Emergency', detail: '999 / 111', tel: '999' },
  ],
  IE: [
    { name: 'Samaritans', detail: '116 123 · free, 24/7', tel: '116123' },
    { name: 'Emergency', detail: '112 / 999', tel: '112' },
  ],
  US: [
    { name: 'Maternal Mental Health', detail: 'Call or text 1-833-943-5746', tel: '18339435746' },
    { name: 'Postpartum Support Intl', detail: 'Call or text 1-800-944-4773', tel: '18009444773' },
    { name: 'Emergency', detail: '911 / 988', tel: '911' },
  ],
  FR: [
    { name: 'SOS Amitié', detail: '09 72 39 40 50', tel: '0972394050' },
    { name: 'Urgences', detail: '112 / 15', tel: '112' },
  ],
  AU: [
    { name: 'PANDA (perinatal)', detail: '1300 726 306', tel: '1300726306' },
    { name: 'Lifeline', detail: '13 11 14', tel: '131114' },
    { name: 'Emergency', detail: '000', tel: '000' },
  ],
  CA: [
    { name: 'Talk Suicide Canada', detail: '1-833-456-4566', tel: '18334564566' },
    { name: 'Emergency', detail: '911', tel: '911' },
  ],
};

/** Helplines for a 2-letter country code (falls back to an international set). */
export function helplinesFor(country?: string): Helpline[] {
  const key = (country ?? '').toUpperCase();
  return BY_COUNTRY[key] ?? INTERNATIONAL;
}

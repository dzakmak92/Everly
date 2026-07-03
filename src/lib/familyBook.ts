/**
 * Family-book export — turns a child's milestones (and their attached photos)
 * into a print-ready "Storybook" keepsake: a self-contained HTML document sized
 * for a square 21×21 cm (8×8") photobook. On web it opens in a new window with a
 * "Save as PDF / Print" action; the browser's PDF export produces a genuine
 * print file (vector-sharp text, full-resolution photos) with no PDF library.
 *
 * The page list is assembled from real data with the design rules approved in
 * the mockups: cover + dedication, chapter dividers per stage, one page per
 * milestone drawn from a rotating pool of layout templates (no template repeats
 * within a 5-page window, palette shifts page-to-page), pinned signature layouts
 * for the birth and first-birthday pages, and a closing page.
 */
import { Platform } from 'react-native';
import type { Child, Milestone } from './store';
import { getMediaDataURL } from './mediaStore';
import type { MilestoneMedia } from './store';

/** A photo resolved to an embeddable URL (full-res data-URL, or thumbnail). */
type BookMedia = { url: string; kind: 'photo' | 'video' };

const DAY = 86400000;

// ── text/number helpers ────────────────────────────────────────────────────
function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function ageDaysAt(birthDate: string | undefined, date: string): number | null {
  if (!birthDate) return null;
  const b = new Date(`${birthDate}T00:00:00`).getTime();
  const d = new Date(date.length <= 10 ? `${date}T00:00:00` : date).getTime();
  if (isNaN(b) || isNaN(d)) return null;
  return Math.round((d - b) / DAY);
}
function longDate(iso: string): string {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}
function yearOf(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  return isNaN(d.getTime()) ? '' : String(d.getFullYear());
}
/** A small age medallion label, e.g. { top:'MONTHS', value:'6' }. */
function badgeFor(ageDays: number | null): { top: string; value: string } | null {
  if (ageDays == null) return null;
  if (ageDays < 0) return { top: 'WEEK', value: String(Math.max(4, 40 + Math.round(ageDays / 7))) };
  if (ageDays === 0) return { top: 'DAY', value: 'one' };
  if (ageDays < 14) return { top: 'DAY', value: String(ageDays) };
  if (ageDays < 70) return { top: 'WEEKS', value: String(Math.round(ageDays / 7)) };
  if (ageDays < 365) return { top: 'MONTHS', value: String(Math.max(1, Math.round(ageDays / 30.44))) };
  if (ageDays < 730) return { top: 'YEAR', value: '1' };
  return { top: 'YEARS', value: String(Math.floor(ageDays / 365)) };
}
/** A friendly kicker phrase for the small caps line above a title. */
function ageWords(ageDays: number | null, date: string): string {
  if (ageDays == null) return longDate(date);
  if (ageDays < 0) return `Week ${Math.max(4, 40 + Math.round(ageDays / 7))}`;
  if (ageDays === 0) return 'The big day';
  if (ageDays < 14) return `Day ${ageDays}`;
  if (ageDays < 70) return `${Math.round(ageDays / 7)} weeks`;
  if (ageDays < 365) return `${Math.max(1, Math.round(ageDays / 30.44))} months`;
  if (ageDays < 730) return 'One year';
  return `${Math.floor(ageDays / 365)} years`;
}
function stageOf(ageDays: number | null): string {
  if (ageDays == null) return 'Moments';
  if (ageDays < 0) return 'Before you arrived';
  if (ageDays <= 30) return 'The day we met';
  if (ageDays <= 400) return 'Your first year';
  return 'Growing up';
}
function isBirthTitle(m: Milestone): boolean {
  return /\b(birth|born|the big day|arrived|hello world)\b/i.test(m.title);
}
function isFirstBirthday(m: Milestone): boolean {
  return /(first birthday|1st birthday|one year|turned one|1 year)/i.test(m.title);
}

// ── the page model ──────────────────────────────────────────────────────────
type Tint = 't-rose' | 't-peach' | 't-gold' | 't-mint' | 't-lav' | 't-sage' | 't-blue';
const PALETTES: Tint[] = ['t-rose', 't-peach', 't-gold', 't-mint', 't-lav', 't-sage', 't-blue'];
const POOL = ['arch', 'gallery', 'split', 'postcard', 'quote', 'duo', 'side', 'botanical', 'window', 'medallion', 'deck', 'ring', 'grid', 'vignette'] as const;
type TemplateName = (typeof POOL)[number];

/** Minimum photos a multi-photo template needs to look right. */
const NEED: Partial<Record<TemplateName, number>> = { duo: 2, deck: 2, grid: 3 };

/** Assign a template per milestone: rotate the pool, never repeating within a
 *  5-page window, and only pick a multi-photo layout when the milestone has
 *  enough photos to fill it. Deterministic — the same book always renders
 *  identically. `mediaCounts[i]` is the photo count for milestone i. */
function assignTemplates(mediaCounts: number[]): TemplateName[] {
  const recent: string[] = [];
  const out: TemplateName[] = [];
  let i = 0;
  for (const cnt of mediaCounts) {
    let t: TemplateName;
    let tries = 0;
    const bad = (name: TemplateName) => recent.includes(name) || ((NEED[name] ?? 0) > cnt);
    do {
      t = POOL[i % POOL.length];
      i++;
      tries++;
    } while (bad(t) && tries <= POOL.length * 2);
    if ((NEED[t] ?? 0) > cnt) t = 'gallery'; // safe single-photo fallback
    out.push(t);
    recent.push(t);
    if (recent.length > 5) recent.shift();
  }
  return out;
}

// ── photo / fragment helpers ────────────────────────────────────────────────
function photo(media: BookMedia | undefined, cls: string, style: string): string {
  if (media?.url) return `<div class="ph ${cls}" style="${style}"><img class="pimg" src="${media.url}"></div>`;
  return `<div class="ph ${cls}" style="${style}"><span class="glyph"></span></div>`;
}
function frame(media: BookMedia | undefined, tint: Tint, style: string): string {
  return `<div class="frame ${media?.url ? '' : tint}" style="${style}">${media?.url ? `<img class="pimg" src="${media.url}">` : '<span class="glyph"></span>'}</div>`;
}
function pnum(n: number, light = false): string {
  return `<div class="pnum${light ? ' light' : ''}">~ ${n} ~</div>`;
}

// ── per-template renderers (square 1:1) ─────────────────────────────────────
type PageCtx = { title: string; note: string; kicker: string; badge: { top: string; value: string } | null; tint: Tint; media: BookMedia[]; n: number };

function tplArch(c: PageCtx): string {
  return `<div class="page" style="padding:8% 8% 9%;">
    <div style="display:flex;align-items:flex-start;gap:14px;">
      <div class="bignum">${esc(c.badge?.value ?? '·')}</div>
      <div style="padding-top:6px;"><div class="kicker">${esc(c.kicker)}</div><div class="mtitle" style="font-size:26px;margin-top:2px;">${esc(c.title)}</div></div>
    </div>
    ${photo(c.media[0], c.tint, 'width:62%;aspect-ratio:1/1.05;border-radius:50% 50% 12px 12px;border:7px solid #fff;box-shadow:0 10px 22px rgba(60,40,70,.16);margin:6% auto 0;')}
    ${c.note ? `<p class="cap" style="text-align:center;margin-top:6%;">${esc(c.note)}</p>` : ''}
    ${pnum(c.n)}
  </div>`;
}
function tplGallery(c: PageCtx): string {
  return `<div class="page grad-soft" style="padding:9%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
    <div style="background:#fff;padding:5%;border-radius:6px;box-shadow:0 16px 32px rgba(60,40,70,.18);">
      ${photo(c.media[0], c.tint, 'width:230px;height:230px;border:1px solid rgba(0,0,0,.05);')}
    </div>
    <div style="margin-top:22px;background:#fff;border-radius:6px;padding:9px 20px;box-shadow:0 6px 14px rgba(60,40,70,.12);text-align:center;">
      <div class="lbl">${esc(c.kicker)}</div><div class="mtitle" style="font-size:19px;">${esc(c.title)}</div>
    </div>
    ${c.note ? `<p class="cap" style="text-align:center;margin-top:16px;">${esc(c.note)}</p>` : ''}
    ${pnum(c.n)}
  </div>`;
}
function tplSplit(c: PageCtx): string {
  return `<div class="page dots" style="padding:0;display:flex;">
    <div style="flex:1;padding:9% 6% 9% 9%;display:flex;flex-direction:column;justify-content:center;">
      <div class="kicker">${esc(c.kicker)}</div>
      <div class="mtitle" style="font-size:24px;margin:10px 0 12px;">${esc(c.title)}</div>
      <div class="rule" style="margin:0 0 12px;width:40px;"></div>
      ${c.note ? `<p class="cap">${esc(c.note)}</p>` : ''}
    </div>
    ${photo(c.media[0], c.tint, 'width:42%;')}
    ${pnum(c.n)}
  </div>`;
}
function tplPostcard(c: PageCtx): string {
  return `<div class="page grad-soft" style="padding:9%;display:flex;align-items:center;justify-content:center;">
    <div style="width:100%;background:#fff;border-radius:8px;box-shadow:0 14px 28px rgba(60,40,70,.16);padding:16px;">
      ${photo(c.media[0], c.tint, 'height:210px;border-radius:5px;')}
      <div style="display:flex;margin-top:14px;gap:12px;align-items:flex-start;">
        <div style="flex:1;"><div class="hand">${esc(c.title)}</div>${c.note ? `<p class="cap" style="margin-top:3px;">${esc(c.note)}</p>` : ''}</div>
        <div class="stamp"><div>${esc(c.badge?.value ?? '·')}</div><div class="stamp-top">${esc(c.badge?.top ?? '')}</div></div>
      </div>
    </div>
    ${pnum(c.n)}
  </div>`;
}
function tplQuote(c: PageCtx): string {
  const q = c.note || `We will remember ${esc(c.title.toLowerCase())} forever.`;
  return `<div class="page" style="padding:11% 9%;position:relative;">
    <div class="bigquote">&ldquo;</div>
    <div class="mtitle" style="font-size:24px;line-height:1.4;margin-top:6px;">${esc(q)}</div>
    <div class="rule" style="width:44px;margin:18px 0;"></div>
    <div class="lbl">${esc(c.title)} · ${esc(c.kicker)}</div>
    ${frame(c.media[0], c.tint, 'width:36%;aspect-ratio:1;border-radius:8px;position:absolute;right:9%;bottom:12%;transform:rotate(4deg);')}
    ${pnum(c.n)}
  </div>`;
}
function tplDuo(c: PageCtx): string {
  return `<div class="page" style="padding:8% 7%;display:flex;flex-direction:column;align-items:center;">
    <div class="kicker">${esc(c.kicker)}</div>
    <div class="mtitle" style="font-size:24px;margin:6px 0 18px;">${esc(c.title)}</div>
    <div style="display:flex;gap:14px;">
      ${frame(c.media[0], c.tint, 'width:40%;aspect-ratio:.85;transform:rotate(-2deg);')}
      ${frame(c.media[1], c.tint === 't-gold' ? 't-peach' : 't-gold', 'width:40%;aspect-ratio:.85;transform:rotate(2deg);margin-top:16px;')}
    </div>
    ${c.note ? `<p class="cap" style="text-align:center;margin-top:20px;padding:0 8%;">${esc(c.note)}</p>` : ''}
    ${pnum(c.n)}
  </div>`;
}
function tplSide(c: PageCtx): string {
  return `<div class="page" style="padding:0;display:flex;">
    ${photo(c.media[0], c.tint, 'width:46%;')}
    <div style="flex:1;padding:9% 7%;display:flex;flex-direction:column;justify-content:center;">
      <div class="bignum" style="font-size:56px;">${esc(c.badge?.value ?? '·')}</div>
      <div class="kicker" style="margin-top:8px;">${esc(c.badge?.top ?? c.kicker)}</div>
      <div class="mtitle" style="font-size:22px;margin:8px 0 12px;">${esc(c.title)}</div>
      <div class="rule" style="margin:0 0 12px;width:34px;"></div>
      ${c.note ? `<p class="cap">${esc(c.note)}</p>` : ''}
    </div>
    ${pnum(c.n)}
  </div>`;
}
function tplBotanical(c: PageCtx): string {
  return `<div class="page" style="padding:9%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
    <span class="botl">🌿</span><span class="botr">🌸</span>
    <div class="kicker" style="margin-bottom:14px;">${esc(c.kicker)}</div>
    ${photo(c.media[0], c.tint, 'width:62%;aspect-ratio:1;border-radius:14px;border:7px solid #fff;box-shadow:0 10px 22px rgba(60,40,70,.16);')}
    <div class="mtitle" style="font-size:22px;margin-top:18px;">${esc(c.title)}</div>
    <div class="rule" style="width:36%;"></div>
    ${c.note ? `<p class="cap" style="text-align:center;">${esc(c.note)}</p>` : ''}
    ${pnum(c.n)}
  </div>`;
}
function tplWindow(c: PageCtx): string {
  return `<div class="page" style="padding:0;display:flex;flex-direction:column;">
    <div style="flex:1;background:linear-gradient(160deg,#EFE7F3,#FBF6EE);padding:9% 10% 0;display:flex;flex-direction:column;align-items:center;">
      <div class="kicker" style="margin-bottom:10px;">${esc(c.kicker)}</div>
      ${photo(c.media[0], c.tint, 'width:60%;aspect-ratio:.82;border-radius:50% 50% 0 0;border:7px solid #fff;border-bottom:none;box-shadow:0 -6px 20px rgba(60,40,70,.12);')}
    </div>
    <div style="background:#fff;padding:16px 20px 20px;text-align:center;box-shadow:0 -4px 14px rgba(60,40,70,.08);">
      <div class="mtitle" style="font-size:21px;">${esc(c.title)}</div>
      ${c.note ? `<p class="cap">${esc(c.note)}</p>` : ''}
    </div>
    ${pnum(c.n)}
  </div>`;
}
function tplMedallion(c: PageCtx): string {
  return `<div class="page" style="padding:8%;display:flex;flex-direction:column;align-items:center;">
    ${photo(c.media[0], c.tint, 'width:100%;aspect-ratio:1.16;border-radius:14px;')}
    <div class="medallion">${c.badge ? `<div class="med-v">${esc(c.badge.value)}</div><div class="med-t">${esc(c.badge.top)}</div>` : ''}</div>
    <div class="mtitle" style="font-size:23px;margin-top:12px;">${esc(c.title)}</div>
    <div class="rule" style="width:40%;"></div>
    ${c.note ? `<p class="cap" style="text-align:center;padding:0 6%;">${esc(c.note)}</p>` : ''}
    ${pnum(c.n)}
  </div>`;
}
function tplDeck(c: PageCtx): string {
  const t2: Tint = 't-lav', t3: Tint = 't-mint';
  return `<div class="page dots" style="padding:8%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
    <div style="position:relative;width:70%;aspect-ratio:1.05;">
      ${frame(c.media[2], t3, 'width:88%;height:82%;position:absolute;left:12%;top:18%;transform:rotate(-6deg);')}
      ${frame(c.media[1], t2, 'width:88%;height:82%;position:absolute;left:7%;top:9%;transform:rotate(3deg);')}
      ${frame(c.media[0], c.tint, 'width:88%;height:82%;position:absolute;left:0;top:0;transform:rotate(-1deg);')}
    </div>
    <div class="mtitle" style="font-size:22px;margin-top:22px;">${esc(c.title)}</div>
    ${c.note ? `<p class="cap" style="text-align:center;">${esc(c.note)}</p>` : ''}
    ${pnum(c.n)}
  </div>`;
}
function tplRing(c: PageCtx): string {
  return `<div class="page grad-radial" style="padding:9%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
    <div style="position:relative;width:64%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;">
      <div class="ring-dash"></div>
      ${photo(c.media[0], c.tint, 'width:86%;height:86%;border-radius:50%;border:7px solid #fff;box-shadow:0 10px 22px rgba(60,40,70,.16);')}
    </div>
    <div class="mtitle" style="font-size:23px;margin-top:16px;">${esc(c.title)}</div>
    ${c.note ? `<p class="cap" style="text-align:center;">${esc(c.note)}</p>` : ''}
    ${pnum(c.n)}
  </div>`;
}
function tplGrid(c: PageCtx): string {
  const tints: Tint[] = ['t-rose', 't-blue', 't-gold', 't-mint'];
  const cells = [0, 1, 2, 3].map((i) => photo(c.media[i], tints[i], 'aspect-ratio:1.1;border-radius:8px;')).join('');
  return `<div class="page" style="padding:8%;display:flex;flex-direction:column;">
    <div style="text-align:center;"><div class="kicker">${esc(c.kicker)}</div><div class="mtitle" style="font-size:21px;margin:4px 0 14px;">${esc(c.title)}</div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;">${cells}</div>
    ${c.note ? `<p class="cap" style="text-align:center;margin-top:14px;">${esc(c.note)}</p>` : ''}
    ${pnum(c.n)}
  </div>`;
}
function tplVignette(c: PageCtx): string {
  return `<div class="page grad-radial" style="padding:9%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
    <div class="kicker" style="margin-bottom:8px;">${esc(c.kicker)}</div>
    ${photo(c.media[0], c.tint, 'width:64%;aspect-ratio:1;border-radius:50%;border:7px solid #fff;box-shadow:0 10px 22px rgba(60,40,70,.16);')}
    <div class="mtitle" style="font-size:23px;margin-top:16px;">${esc(c.title)}</div>
    <div class="rule" style="width:38%;"></div>
    ${c.note ? `<p class="cap" style="text-align:center;">${esc(c.note)}</p>` : ''}
    ${pnum(c.n)}
  </div>`;
}

const RENDERERS: Record<TemplateName, (c: PageCtx) => string> = {
  arch: tplArch, gallery: tplGallery, split: tplSplit, postcard: tplPostcard, quote: tplQuote,
  duo: tplDuo, side: tplSide, botanical: tplBotanical, window: tplWindow, medallion: tplMedallion,
  deck: tplDeck, ring: tplRing, grid: tplGrid, vignette: tplVignette,
};

// ── signature + front/back-matter pages ─────────────────────────────────────
function pageBirth(c: PageCtx, dateStr: string): string {
  return `<div class="page" style="padding:0;">
    ${photo(c.media[0], c.tint, 'height:100%;')}
    <div class="birth-overlay"></div>
    <div style="position:absolute;left:8%;right:8%;bottom:9%;">
      <div class="badge" style="margin-bottom:10px;">🎉 ${esc(dateStr)}</div>
      <div class="serif" style="color:#fff;font-size:28px;line-height:1.14;text-shadow:0 2px 10px rgba(0,0,0,.3);">${esc(c.title)}</div>
      ${c.note ? `<div class="serif ital" style="color:rgba(255,255,255,.9);font-size:14px;margin-top:8px;">${esc(c.note)}</div>` : ''}
    </div>
    ${pnum(c.n, true)}
  </div>`;
}
function pageBirthday(c: PageCtx): string {
  return `<div class="page grad-birthday" style="padding:8%;display:flex;flex-direction:column;align-items:center;">
    <div class="serif big-one">1</div>
    <div class="mtitle" style="font-size:24px;margin-top:2px;">${esc(c.title)}</div>
    <div style="display:flex;margin:18px 0 4px;">
      ${frame(c.media[0], 't-rose', 'width:26%;aspect-ratio:1;transform:rotate(-6deg);')}
      ${frame(c.media[1], 't-gold', 'width:30%;aspect-ratio:1;margin:-4px -10px 0;z-index:2;')}
      ${frame(c.media[2], 't-mint', 'width:26%;aspect-ratio:1;transform:rotate(6deg);')}
    </div>
    ${c.note ? `<p class="cap" style="text-align:center;margin-top:14px;padding:0 6%;">${esc(c.note)}</p>` : ''}
    ${pnum(c.n)}
  </div>`;
}
function pageCover(name: string, year: string, hero: BookMedia | undefined): string {
  return `<div class="page grad-cover" style="display:flex;flex-direction:column;align-items:center;padding:11% 8%;">
    <span class="star" style="top:8%;left:10%;">✦</span><span class="star" style="top:16%;right:12%;font-size:10px;">✧</span>
    <div class="lbl" style="margin-top:2%;">A Family Keepsake</div>
    ${frame(hero, 't-gold', 'width:46%;aspect-ratio:1;border-radius:50%;margin:8% 0 6%;')}
    <div class="serif" style="font-size:32px;color:var(--ink);text-align:center;line-height:1.1;">The Story<br><span style="color:var(--roseInk);">of ${esc(name)}</span></div>
    <div class="rule"></div>
    <div class="serif ital" style="font-size:14px;color:var(--muted);text-align:center;">a story of firsts, one moment at a time</div>
    <div style="flex:1;"></div>
    <div class="serif" style="font-size:12px;color:var(--gold);letter-spacing:3px;">${year ? `·  ${esc(year)}  ·` : ''}</div>
  </div>`;
}
function pageOpening(name: string): string {
  return `<div class="page" style="padding:11% 9%;">
    <span class="star" style="top:9%;right:11%;">✧</span>
    <div class="lbl" style="text-align:center;margin-bottom:8%;">Once upon a time</div>
    <p class="serif" style="font-size:17px;line-height:1.75;color:var(--ink);text-align:justify;">
      <span class="drop">T</span>his little book holds the story of ${esc(name)} — the firsts and the everyday moments, the tiny milestones that we never want to forget. Every page is a memory we get to keep forever.</p>
    <p class="cap" style="text-align:center;margin-top:8%;">With all our love.</p>
    <div class="pnum">~ i ~</div>
  </div>`;
}
function pageDivider(chapter: string, title: string, sub: string): string {
  return `<div class="page grad-divider" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10%;">
    <div class="lbl">${esc(chapter)}</div>
    <div class="serif" style="font-size:30px;color:var(--roseInk);text-align:center;margin:14px 0;line-height:1.2;">${esc(title)}</div>
    <div class="rule" style="width:36%;"></div>
    <p class="cap" style="text-align:center;padding:0 12%;">${esc(sub)}</p>
  </div>`;
}
function pageClosing(): string {
  return `<div class="page grad-closing" style="padding:10%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
    <span class="star" style="top:11%;left:11%;">✦</span><span class="star" style="bottom:14%;right:12%;font-size:11px;">✧</span>
    <div class="serif" style="font-size:24px;color:var(--ink);line-height:1.25;">…and the story is<br>only just beginning.</div>
    <div class="rule" style="width:36%;"></div>
    <div class="hand" style="font-size:20px;color:var(--roseInk);">To be continued 💫</div>
    <div class="lbl" style="margin-top:7%;">made with love · Everly</div>
  </div>`;
}

const CHAPTER_WORDS = ['Chapter One', 'Chapter Two', 'Chapter Three', 'Chapter Four', 'Chapter Five'];
const DIVIDER_SUBS: Record<string, string> = {
  'Before you arrived': 'The months we spent dreaming about you.',
  'The day we met': 'Everything changed in a single morning.',
  'Your first year': 'Firsts, big and small — one after another.',
  'Growing up': 'Bigger, braver, and more you every day.',
  Moments: 'The moments we never want to forget.',
};

// ── book assembly ───────────────────────────────────────────────────────────
/** Build the ordered list of page-HTML strings for the book. Pure/deterministic
 *  given the same milestones + resolved media. Exported for testing. */
export function assembleBookPages(
  child: Child,
  milestones: Milestone[],
  mediaByMilestone: Record<string, BookMedia[]>,
): string[] {
  const list = milestones
    .filter((m) => m.childId === child.id)
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const anyMedia = (id: string) => mediaByMilestone[id] ?? [];
  const heroMedia = list.map((m) => anyMedia(m.id)[0]).find(Boolean);
  const coverYear = yearOf(child.birthDate) || yearOf(list[0]?.date);

  // Exactly one milestone gets the signature birth page: prefer a birth-titled
  // one, else the earliest milestone that lands on day 0.
  const birthId =
    list.find((m) => isBirthTitle(m))?.id ??
    list.find((m) => ageDaysAt(child.birthDate, m.date) === 0)?.id ??
    null;
  const isBirthPage = (m: Milestone) => m.id === birthId;

  const pages: string[] = [];
  pages.push(pageCover(child.name, coverYear, heroMedia));
  pages.push(pageOpening(child.name));

  // template assignment for the non-signature milestones, in order (media-aware)
  const nonSig = list.filter((m) => !isBirthPage(m) && !isFirstBirthday(m));
  const tplByMilestone = new Map<string, TemplateName>();
  const assigned = assignTemplates(nonSig.map((m) => anyMedia(m.id).length));
  nonSig.forEach((m, i) => tplByMilestone.set(m.id, assigned[i]));

  let pageNo = 1;
  let curStage = '';
  let chapterIdx = 0;

  list.forEach((m) => {
    const ad = ageDaysAt(child.birthDate, m.date);
    const stage = stageOf(ad);
    if (stage !== curStage) {
      curStage = stage;
      pages.push(pageDivider(CHAPTER_WORDS[Math.min(chapterIdx, CHAPTER_WORDS.length - 1)], stage, DIVIDER_SUBS[stage] ?? ''));
      chapterIdx++;
    }
    const tint = PALETTES[pageNo % PALETTES.length];
    const ctx: PageCtx = {
      title: m.title,
      note: m.note ?? '',
      kicker: ageWords(ad, m.date),
      badge: badgeFor(ad),
      tint,
      media: anyMedia(m.id),
      n: pageNo,
    };
    if (isBirthPage(m)) pages.push(pageBirth(ctx, longDate(m.date)));
    else if (isFirstBirthday(m)) pages.push(pageBirthday(ctx));
    else pages.push(RENDERERS[tplByMilestone.get(m.id)!](ctx));
    pageNo++;
  });

  pages.push(pageClosing());
  return pages;
}

// ── document CSS ────────────────────────────────────────────────────────────
const BOOK_CSS = `
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{--ivory:#FBF6EE;--ink:#3C3348;--muted:#9a8f88;--rose:#D98CA9;--roseInk:#B0678A;--gold:#CBA24A;
    --serif:'Georgia','Iowan Old Style','Times New Roman',serif;--sans:-apple-system,'Segoe UI',Roboto,sans-serif;}
  html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  body{background:#E7E3EF;background-image:radial-gradient(circle at 30% 6%,#EFEBF6,#E2DEEC);font-family:var(--sans);padding:96px 24px 60px;}
  .toolbar{position:fixed;top:0;left:0;right:0;z-index:99;background:rgba(255,255,255,.94);backdrop-filter:blur(8px);
    box-shadow:0 2px 14px rgba(60,40,70,.12);display:flex;align-items:center;justify-content:center;gap:16px;padding:14px 18px;}
  .toolbar .msg{font-family:var(--sans);font-size:13px;color:#6a6080;}
  .toolbar .opt{font-family:var(--sans);font-size:13px;color:#6a6080;display:inline-flex;align-items:center;gap:6px;cursor:pointer;}
  .toolbar .opt .hint{color:#a49cbd;font-size:12px;}
  .toolbar button{font-family:var(--sans);font-size:14px;font-weight:700;color:#fff;background:#6B6FC9;border:none;border-radius:10px;padding:11px 20px;cursor:pointer;box-shadow:0 6px 14px rgba(107,111,201,.34);}
  .book{display:flex;flex-direction:column;align-items:center;gap:26px;max-width:560px;margin:0 auto;}
  .page{width:520px;height:520px;background:var(--ivory);border-radius:12px;position:relative;overflow:hidden;
    box-shadow:0 18px 40px rgba(60,40,70,.16),inset 0 0 0 1px rgba(203,162,74,.10);}
  .page::before{content:'';position:absolute;left:0;top:0;bottom:0;width:16px;background:linear-gradient(90deg,rgba(60,40,70,.09),rgba(60,40,70,0));z-index:5;}
  .pimg{width:100%;height:100%;object-fit:cover;display:block;}
  .pnum{position:absolute;bottom:16px;left:0;right:0;text-align:center;font-family:var(--serif);font-size:12px;color:var(--muted);letter-spacing:1px;z-index:6;}
  .pnum.light{color:rgba(255,255,255,.85);}
  .frame{border:6px solid #fff;box-shadow:0 8px 18px rgba(60,40,70,.16);overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;background:#eee;}
  .ph{display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;}
  .ph::after{content:'';position:absolute;inset:0;box-shadow:inset 0 0 40px rgba(80,50,70,.08);}
  .glyph{width:52px;height:40px;border:3px solid rgba(255,255,255,.85);border-radius:7px;position:relative;filter:drop-shadow(0 2px 4px rgba(60,40,70,.12));}
  .glyph::before{content:'';position:absolute;left:8px;bottom:8px;width:13px;height:13px;border-radius:50%;background:rgba(255,255,255,.9);}
  .glyph::after{content:'';position:absolute;right:7px;bottom:7px;border-left:18px solid transparent;border-bottom:16px solid rgba(255,255,255,.9);}
  .t-rose{background:linear-gradient(135deg,#F6D3E0,#EFDCEE);}.t-blue{background:linear-gradient(135deg,#D6E1F6,#E6D6EE);}
  .t-gold{background:linear-gradient(135deg,#F7E6C8,#F4D3DE);}.t-mint{background:linear-gradient(135deg,#D4EBE1,#DFE5F6);}
  .t-peach{background:linear-gradient(135deg,#F8DDCB,#F3D0DD);}.t-lav{background:linear-gradient(135deg,#E4DAF2,#D8E1F6);}
  .t-sage{background:linear-gradient(135deg,#DDE9D6,#E9E3F0);}
  .serif{font-family:var(--serif);}.ital{font-style:italic;}
  .drop{float:left;font-family:var(--serif);font-size:54px;line-height:44px;color:var(--roseInk);padding:6px 10px 0 0;}
  .star{position:absolute;color:var(--gold);opacity:.55;font-size:14px;}
  .rule{height:1px;background:linear-gradient(90deg,transparent,rgba(203,162,74,.5),transparent);margin:12px auto;width:64%;}
  .badge{display:inline-flex;align-items:center;gap:6px;background:#fff;border-radius:999px;padding:6px 13px;font-size:11px;font-weight:800;color:var(--roseInk);box-shadow:0 4px 10px rgba(60,40,70,.10);letter-spacing:.3px;}
  .medallion{width:64px;height:64px;border-radius:50%;background:#fff;box-shadow:0 6px 14px rgba(60,40,70,.14);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:var(--serif);margin-top:-32px;z-index:2;border:4px solid var(--ivory);}
  .med-v{font-size:17px;color:var(--roseInk);font-weight:700;line-height:1;}.med-t{font-size:8px;color:var(--muted);letter-spacing:.5px;margin-top:1px;}
  .hand{font-family:'Bradley Hand','Segoe Script',cursive;font-size:19px;color:var(--roseInk);}
  .lbl{font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--muted);}
  .cap{font-family:var(--serif);font-size:14px;line-height:1.6;color:var(--muted);font-style:italic;}
  .mtitle{font-family:var(--serif);color:var(--ink);line-height:1.12;}
  .kicker{font-family:var(--serif);font-size:12px;color:var(--roseInk);letter-spacing:2px;text-transform:uppercase;}
  .bignum{font-family:var(--serif);font-size:76px;color:rgba(176,103,138,.16);line-height:.8;}
  .bigquote{font-family:var(--serif);font-size:64px;color:rgba(176,103,138,.22);line-height:.5;}
  .big-one{font-size:104px;color:var(--gold);line-height:.9;text-shadow:0 4px 14px rgba(203,162,74,.3);}
  .dots{background-image:radial-gradient(rgba(176,103,138,.16) 1.5px,transparent 1.5px);background-size:16px 16px;}
  .stamp{width:50px;height:60px;border:2px solid rgba(176,103,138,.3);border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:var(--serif);color:var(--roseInk);flex:none;}
  .stamp>div:first-child{font-size:15px;font-weight:700;}.stamp-top{font-size:8px;letter-spacing:.5px;}
  .botl{position:absolute;top:5%;left:5%;font-size:34px;opacity:.5;transform:rotate(-20deg);}
  .botr{position:absolute;bottom:12%;right:6%;font-size:30px;opacity:.5;transform:rotate(30deg);}
  .ring-dash{position:absolute;inset:0;border-radius:50%;border:1.5px dashed rgba(176,103,138,.4);}
  .birth-overlay{position:absolute;inset:0;background:linear-gradient(transparent 46%,rgba(40,28,48,.64));}
  .grad-soft{background:linear-gradient(160deg,#F5EEF3,#FBF6EE);}
  .grad-radial{background:radial-gradient(58% 50% at 50% 44%,#FBEFE0,#F1E4EF);}
  .grad-cover{background:radial-gradient(120% 80% at 50% 0%,#F7E7D9,#FBF6EE 60%);}
  .grad-divider{background:linear-gradient(160deg,#F3EAF2,#FBF6EE);}
  .grad-closing{background:radial-gradient(120% 80% at 50% 100%,#F3E7F3,#FBF6EE 60%);}
  .grad-birthday{background:radial-gradient(90% 70% at 50% 30%,#FBEBCF,#F7E1E9);}
  @media print{
    .toolbar{display:none!important;}
    body{background:#fff;padding:0;}
    .book{gap:0;max-width:none;}
    /* Default: trim size exactly. Full-bleed art already reaches the page edge. */
    .page{width:210mm;height:210mm;border-radius:0;box-shadow:none;break-after:page;page-break-after:always;}
    .page:last-child{break-after:auto;page-break-after:auto;}
    .page::before{display:none;}
    /* Bleed on: the sheet grows to 216mm (3mm past trim on every side) so the
       printer can trim to 210mm with no white slivers. Page numbers pull in to
       stay inside the trim-safe area; centred/edge art bleeds off naturally. */
    body.bleed .page{width:216mm;height:216mm;}
    body.bleed .pnum{bottom:9mm;}
  }
`;

/** Assemble + wrap into the full print-ready HTML document (pure). Exported so
 *  the export flow and tests share exactly one code path. */
export function buildBookHTML(
  child: Child,
  milestones: Milestone[],
  mediaByMilestone: Record<string, BookMedia[]>,
): string {
  return buildHTML(child, assembleBookPages(child, milestones, mediaByMilestone));
}

function buildHTML(child: Child, pages: string[]): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>The Story of ${esc(child.name)}</title>
<style>${BOOK_CSS}</style>
<style id="ps">@page{size:216mm 216mm;margin:0;}</style>
</head><body class="bleed">
<div class="toolbar">
  <span class="msg">To save your book: <b>Print → Save as PDF</b>, paper size <b><span id="psize">216×216&nbsp;mm</span></b> (or “Square”), margins <b>None</b>.</span>
  <label class="opt"><input type="checkbox" id="bleedbox" checked onchange="toggleBleed(this.checked)"> 3&nbsp;mm bleed <span class="hint">(for print shops)</span></label>
  <button onclick="window.print()">Save as PDF / Print</button>
</div>
<div class="book">${pages.join('\n')}</div>
<script>
  function toggleBleed(on){
    document.body.classList.toggle('bleed', on);
    document.getElementById('ps').textContent = '@page{size:' + (on ? '216mm 216mm' : '210mm 210mm') + ';margin:0;}';
    document.getElementById('psize').innerHTML = on ? '216×216&nbsp;mm' : '210×210&nbsp;mm';
  }
</script>
</body></html>`;
}

// ── public entry point ──────────────────────────────────────────────────────
/**
 * Resolve the child's milestone photos, assemble the book, and open it in a new
 * window ready to print / save as PDF. Web only — resolves false on native (the
 * caller should fall back to the text share).
 */
export async function openFamilyBook(
  child: Child,
  milestones: Milestone[],
  milestoneMedia: Record<string, MilestoneMedia[]>,
): Promise<boolean> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return false;
  // Open the window synchronously (inside the click) so pop-up blockers allow it.
  const win = window.open('', '_blank');

  const forChild = milestones.filter((m) => m.childId === child.id);
  const resolved: Record<string, BookMedia[]> = {};
  for (const m of forChild) {
    const refs = milestoneMedia[m.id] ?? [];
    const out: BookMedia[] = [];
    for (const r of refs) {
      // Photos: prefer the full-res blob; fall back to the thumbnail. Videos:
      // use the poster thumbnail (a still can't animate on paper anyway).
      const url = r.kind === 'photo' ? (await getMediaDataURL(r.id)) ?? r.thumb : r.thumb;
      if (url) out.push({ url, kind: r.kind });
    }
    resolved[m.id] = out;
  }

  const pages = assembleBookPages(child, milestones, resolved);
  const html = buildHTML(child, pages);
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
    return true;
  }
  // Pop-up blocked: fall back to a data-URL navigation in a new tab.
  const a = document.createElement('a');
  a.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
  a.target = '_blank';
  a.rel = 'noopener';
  a.click();
  return true;
}

import { Platform } from 'react-native';
import { putMedia } from './mediaStore';

/** A reference to an attached photo/video: a small thumbnail (stored in app
 *  state) + an id pointing at the full blob in IndexedDB. */
export type MediaRef = { id: string; kind: 'photo' | 'video'; thumb: string };

function newId() {
  return `md-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

async function scale(img: HTMLImageElement, max: number, quality: number): Promise<{ blob: Blob; dataUrl: string }> {
  const s = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * s)), h = Math.max(1, Math.round(img.height * s));
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d')!.drawImage(img, 0, 0, w, h);
  const dataUrl = c.toDataURL('image/jpeg', quality);
  const blob = await new Promise<Blob>((res) => c.toBlob((b) => res(b as Blob), 'image/jpeg', quality));
  return { blob, dataUrl };
}

function videoThumb(file: File): Promise<string> {
  return new Promise((resolve) => {
    const v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.src = URL.createObjectURL(file);
    const done = (url: string) => { try { URL.revokeObjectURL(v.src); } catch { /* noop */ } resolve(url); };
    v.onloadeddata = () => { try { v.currentTime = Math.min(0.1, (v.duration || 0.2) / 2); } catch { done(''); } };
    v.onseeked = () => {
      const s = Math.min(1, 320 / Math.max(v.videoWidth || 1, v.videoHeight || 1));
      const c = document.createElement('canvas'); c.width = Math.max(1, Math.round((v.videoWidth || 1) * s)); c.height = Math.max(1, Math.round((v.videoHeight || 1) * s));
      try { c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height); done(c.toDataURL('image/jpeg', 0.7)); } catch { done(''); }
    };
    v.onerror = () => done('');
  });
}

/**
 * Opens the system picker and returns processed media refs (full blobs are put
 * into IndexedDB). Web only — resolves to [] elsewhere or on cancel.
 */
export function pickMedia(): Promise<MediaRef[]> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return Promise.resolve([]);
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*,video/*'; input.multiple = true;
    let settled = false;
    const finish = (v: MediaRef[]) => { if (!settled) { settled = true; resolve(v); } };
    input.onchange = async () => {
      const files = Array.from(input.files || []);
      const out: MediaRef[] = [];
      for (const f of files) {
        const id = newId();
        try {
          if (f.type.startsWith('video')) {
            const thumb = await videoThumb(f);
            await putMedia(id, f);
            out.push({ id, kind: 'video', thumb });
          } else {
            const url = URL.createObjectURL(f);
            const img = await loadImage(url);
            const full = await scale(img, 1280, 0.72);
            const thumb = (await scale(img, 320, 0.7)).dataUrl;
            await putMedia(id, full.blob);
            URL.revokeObjectURL(url);
            out.push({ id, kind: 'photo', thumb });
          }
        } catch { /* skip a file that fails to process */ }
      }
      finish(out);
    };
    // Cancel fallback: when focus returns with no selection, resolve empty.
    const onFocus = () => { setTimeout(() => { if (!input.files || input.files.length === 0) finish([]); window.removeEventListener('focus', onFocus); }, 400); };
    window.addEventListener('focus', onFocus);
    input.click();
  });
}

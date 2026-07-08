import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

/**
 * Makes the phone/browser Back button close an open popup first (instead of
 * navigating the page underneath). On web it parks a history entry while the
 * popup is open and pops it on Back; on native the RN <Modal onRequestClose>
 * already handles the hardware back, so this is a no-op there.
 */
export function useBackClose(visible: boolean, onClose: () => void) {
  const cb = useRef(onClose);
  cb.current = onClose;
  useEffect(() => {
    if (Platform.OS !== 'web' || !visible || typeof window === 'undefined') return;
    const onPop = () => cb.current();
    window.history.pushState({ __everlyModal: true }, '');
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      // Closed via a button (not Back): remove the parked entry so history stays clean.
      const st = window.history.state as { __everlyModal?: boolean } | null;
      if (st && st.__everlyModal) window.history.back();
    };
  }, [visible]);
}

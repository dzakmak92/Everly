import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View, Text, Pressable, Modal, Animated, Easing } from 'react-native';
import { color, font, radius, shadow } from '../theme/tokens';

/**
 * App-wide lightweight feedback: a transient bottom toast for confirmations
 * ("Saved", "Loaded") and a promise-based confirm dialog for actions that need
 * a heads-up first (e.g. loading a starter list that would duplicate items).
 *
 * React Native's Alert isn't reliable on web, so both are in-app overlays.
 */
type ConfirmOpts = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  accent?: string;
};
type FeedbackCtx = {
  toast: (msg: string) => void;
  confirm: (o: ConfirmOpts) => Promise<boolean>;
};

const Ctx = createContext<FeedbackCtx>({ toast: () => {}, confirm: async () => false });
export const useFeedback = () => useContext(Ctx);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((m: string) => {
    setMsg(m);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    opacity.stopAnimation(); translateY.stopAnimation();
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
    hideTimer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 12, duration: 220, useNativeDriver: true }),
      ]).start(() => setMsg(null));
    }, 2100);
  }, [opacity, translateY]);

  const [cfm, setCfm] = useState<(ConfirmOpts & { resolve: (b: boolean) => void }) | null>(null);
  const confirm = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => setCfm({ ...o, resolve })), []);
  const close = (val: boolean) => { cfm?.resolve(val); setCfm(null); };

  return (
    <Ctx.Provider value={{ toast, confirm }}>
      {children}

      {msg != null && (
        <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 104, alignItems: 'center', opacity, transform: [{ translateY }] }}>
          <View style={[{ maxWidth: '86%', backgroundColor: color.ink, borderRadius: radius.pill, paddingVertical: 11, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 8 }, shadow.card]}>
            <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#3ECf8E', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 11, color: '#fff', fontFamily: font.body700 }}>✓</Text>
            </View>
            <Text style={{ fontFamily: font.body700, fontSize: 13, color: '#fff' }}>{msg}</Text>
          </View>
        </Animated.View>
      )}

      <Modal visible={cfm != null} transparent animationType="fade" onRequestClose={() => close(false)}>
        <Pressable onPress={() => close(false)} style={{ flex: 1, backgroundColor: 'rgba(20,16,30,0.38)', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <Pressable onPress={() => {}} style={[{ width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 22, padding: 20 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 17, color: color.ink, marginBottom: 6 }}>{cfm?.title}</Text>
            {cfm?.message ? <Text style={{ fontFamily: font.body400, fontSize: 13.5, color: color.inkSecondary, lineHeight: 20 }}>{cfm.message}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
              <Pressable onPress={() => close(false)} style={({ pressed }) => [{ flex: 1, paddingVertical: 13, borderRadius: 13, alignItems: 'center', borderWidth: 1.5, borderColor: color.hairline, opacity: pressed ? 0.7 : 1 }]}>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.inkSecondary }}>{cfm?.cancelLabel ?? 'Cancel'}</Text>
              </Pressable>
              <Pressable onPress={() => close(true)} style={({ pressed }) => [{ flex: 1, paddingVertical: 13, borderRadius: 13, alignItems: 'center', backgroundColor: cfm?.destructive ? '#D8505A' : (cfm?.accent ?? color.primary), opacity: pressed ? 0.85 : 1 }]}>
                <Text style={{ fontFamily: font.body700, fontSize: 14, color: '#fff' }}>{cfm?.confirmLabel ?? 'Confirm'}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Ctx.Provider>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Platform, Share, Linking, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../../src/theme/tokens';
import { Button, Notice } from '../../../src/components/forms';
import { ChevronRight, Star, Shield, Bell, Moon, Ruler, Globe, Mail, Users, CreditCard, Check, Download, Info } from '../../../src/components/icons';
import { Silhouette } from '../../../src/components/ui';
import { useSupabase, signOut, isAdmin } from '../../../src/lib/supabase';
import { useData } from '../../../src/lib/store';
import { useSettings, exportEverlyData, THEME_LABEL, UNITS_LABEL, DATEFMT_LABEL, WEEKSTART_LABEL, type ThemePref, type UnitsPref, type DateFmt, type WeekStart } from '../../../src/lib/settings';
import { useFeedback } from '../../../src/components/Feedback';

const PLAN_PILL: Record<string, string> = { free: 'Free', pro: 'Pro', family: 'Family', lifetime: 'Lifetime' };
const APP_VERSION = '1.0.0';

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: font.body700, fontSize: 10.5, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted, paddingLeft: 4, marginTop: 14, marginBottom: 8 }}>{children}</Text>;
}
function Card({ children }: { children: React.ReactNode }) {
  return <View style={[{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }, shadow.card]}>{children}</View>;
}
function IconBox({ bg, children }: { bg: string; children: React.ReactNode }) {
  return <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>{children}</View>;
}

/** A tappable settings row: icon + title (+sub) + right accessory (value/chevron/toggle). */
function Row({ icon, bg, title, sub, value, right, danger, first, onPress }: {
  icon?: React.ReactNode; bg?: string; title: string; sub?: string; value?: string; right?: React.ReactNode; danger?: boolean; first?: boolean; onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderTopWidth: first ? 0 : 1, borderTopColor: 'rgba(51,50,74,0.05)', backgroundColor: pressed && onPress ? '#FAF9FE' : '#fff' })}>
      {icon && bg ? <IconBox bg={bg}>{icon}</IconBox> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 13.5, color: danger ? '#E98FB3' : color.ink }}>{title}</Text>
        {sub ? <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted, marginTop: 3 }} numberOfLines={2}>{sub}</Text> : null}
      </View>
      {value ? <Text style={{ fontFamily: font.body500, fontSize: 12, color: color.muted }}>{value}</Text> : null}
      {right !== undefined ? right : onPress ? <ChevronRight size={16} color="#9C9AB2" /> : null}
    </Pressable>
  );
}

function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} style={{ width: 46, height: 28, borderRadius: 14, backgroundColor: on ? color.maternalTeal : '#E4E2EF', padding: 3, justifyContent: 'center' }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', alignSelf: on ? 'flex-end' : 'flex-start' }} />
    </Pressable>
  );
}

/** A radio choice line used inside picker modals. */
function ChoiceRow({ label, sub, selected, onPress, first }: { label: string; sub?: string; selected: boolean; onPress: () => void; first?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 15, borderTopWidth: first ? 0 : 1, borderTopColor: 'rgba(51,50,74,0.05)', backgroundColor: pressed ? '#FAF9FE' : '#fff' })}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{label}</Text>
        {sub ? <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted, marginTop: 2 }}>{sub}</Text> : null}
      </View>
      {selected ? <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' }}><Check size={13} color="#fff" /></View>
        : <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: color.hairline }} />}
    </Pressable>
  );
}

/** Centered modal shell reused by every picker. */
function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 18, gap: 14 }, shadow.card]}>
          <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>{title}</Text>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function SettingsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { session, profile } = useSupabase();
  const { prefs, setPref } = useSettings();
  const { clearAll, loadSampleData, demoPremium, setDemoPremium } = useData();
  const { toast } = useFeedback();

  const [admin, setAdmin] = useState(false);
  useEffect(() => { let a = true; isAdmin().then((v) => { if (a) setAdmin(v); }).catch(() => {}); return () => { a = false; }; }, []);

  const [tab, setTab] = useState(0);
  const pagerRef = useRef<ScrollView>(null);
  function goTab(i: number) { setTab(i); pagerRef.current?.scrollTo({ x: i * width, animated: true }); }
  function onPage(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== tab) setTab(i);
  }

  const [busy, setBusy] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [unitsOpen, setUnitsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [confirmSample, setConfirmSample] = useState(false);

  const planKey = profile?.plan ?? 'free';
  const planLabel = PLAN_PILL[planKey] ?? 'Free';
  const displayName = profile?.name || session?.user?.email || 'Your account';
  const email = session?.user?.email ?? '';

  async function onSignOut() { setBusy(true); await signOut(); setBusy(false); router.replace('/(auth)/welcome'); }

  async function onExport() {
    try {
      const json = await exportEverlyData();
      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `everly-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        toast('Backup downloaded');
      } else {
        await Share.share({ message: json, title: 'Everly backup' });
      }
    } catch { toast('Could not export'); }
  }
  function openLink(url: string, fallback: string) { Linking.openURL(url).catch(() => toast(fallback)); }

  // ── User settings page ──────────────────────────────────────────────────
  const UserPage = (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
      {/* Account hero */}
      <View style={[{ backgroundColor: '#fff', borderRadius: 18, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13 }, shadow.card]}>
        <View style={{ width: 50, height: 50, backgroundColor: '#E7E4FB', borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
          <Silhouette size={27} fill="#6B6FC9" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 15.5, color: color.ink }} numberOfLines={1}>{displayName}</Text>
          {email ? <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 3 }} numberOfLines={1}>{email}</Text> : null}
        </View>
        <View style={{ backgroundColor: '#E7E4FB', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
          <Text style={{ fontFamily: font.body700, fontSize: 11, color: '#6B6FC9' }}>{planLabel}</Text>
        </View>
      </View>

      <SectionHeader>Account</SectionHeader>
      <Card>
        <Row first icon={<CreditCard size={16} color="#C9A33B" />} bg="#FBF1CE" title="Plan & billing" sub={`Current plan: ${planLabel}`} value={planLabel} onPress={() => router.push('/(app)/plans')} />
      </Card>

      <SectionHeader>Preferences</SectionHeader>
      <Card>
        <Row first icon={<Bell size={16} color="#6B6FC9" />} bg="#E7E4FB" title="Notifications" sub="Reminders & weekly digest" onPress={() => setNotifOpen(true)} />
        <Row icon={<Moon size={16} color="#5B77B0" />} bg="#E0EEFB" title="Appearance" value={THEME_LABEL[prefs.theme]} onPress={() => setThemeOpen(true)} />
        <Row icon={<Ruler size={16} color="#2C8475" />} bg="#D8F0E6" title="Units & formats" value={prefs.units === 'metric' ? 'Metric' : 'Imperial'} onPress={() => setUnitsOpen(true)} />
        <Row icon={<Globe size={16} color="#B5662E" />} bg="#FCE6D8" title="Language" value="English" onPress={() => toast('More languages coming soon')} />
      </Card>

      <SectionHeader>Privacy & data</SectionHeader>
      <Card>
        <Row first icon={<Download size={16} color="#6B6FC9" />} bg="#E7E4FB" title="Export my data" sub="Download an on-device JSON backup" onPress={onExport} />
        <Row icon={<Shield size={16} color="#E98FB3" />} bg="#FBE0EA" title="Clear activity log" danger onPress={() => setConfirmWipe(true)} />
      </Card>
      <View style={{ backgroundColor: '#E7E4FB', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 10 }}>
        <Shield size={17} color="#6B6FC9" />
        <Text style={{ flex: 1, fontFamily: font.body400, fontSize: 11.5, lineHeight: 16.5, color: '#54579E' }}>
          <Text style={{ fontFamily: font.body700 }}>Your data lives on this device.</Text> No cloud, no tracking — you control everything.
        </Text>
      </View>

      <SectionHeader>Support</SectionHeader>
      <Card>
        <Row first icon={<Info size={16} color="#5B77B0" />} bg="#E0EEFB" title="Help & FAQ" onPress={() => openLink('https://everly.app/help', 'Visit everly.app/help')} />
        <Row icon={<Mail size={16} color="#2C8475" />} bg="#D8F0E6" title="Contact support" onPress={() => openLink('mailto:support@everly.app', 'support@everly.app')} />
        <Row icon={<Star size={16} color="#C9A33B" />} bg="#FBF1CE" title="Rate Everly" onPress={() => toast('Thanks! Opening the app store…')} />
        <Row icon={<Info size={16} color="#6F6E86" />} bg="#EDECF5" title="About" sub={`Version ${APP_VERSION}`} onPress={() => setAboutOpen(true)} />
      </Card>

      <SectionHeader>Developer</SectionHeader>
      <Card>
        <Row first icon={<Star size={16} color="#2C8475" />} bg="#D8F0E6" title="Load sample data" sub="Demo family + an active pregnancy" onPress={() => setConfirmSample(true)} />
        <Row icon={<Shield size={16} color="#C9A33B" />} bg="#FBF1CE" title="Preview premium" sub="Unlock premium-gated screens" right={<Toggle on={demoPremium} onPress={() => setDemoPremium(!demoPremium)} />} />
      </Card>

      <View style={{ marginTop: 16 }}>
        <Button label="Sign out" variant="secondary" onPress={onSignOut} loading={busy} />
      </View>
    </ScrollView>
  );

  // ── Admin console page ──────────────────────────────────────────────────
  const AdminPage = (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FBF1CE', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 13 }}>
        <Shield size={16} color="#9A7B1F" />
        <Text style={{ fontFamily: font.body700, fontSize: 12, color: '#8A6D18' }}>Operator console — admin only</Text>
      </View>

      <SectionHeader>Manage</SectionHeader>
      <Card>
        <Row first icon={<Users size={16} color="#6B6FC9" />} bg="#E7E4FB" title="Users" sub="Search, suspend, change plan" onPress={() => router.push('/(app)/admin')} />
        <Row icon={<CreditCard size={16} color="#2C8475" />} bg="#D8F0E6" title="Billing" sub="Subscriptions & dunning" onPress={() => router.push('/(app)/admin')} />
        <Row icon={<Shield size={16} color="#B5662E" />} bg="#FCE6D8" title="Config & flags" sub="Feature toggles, remote config" onPress={() => router.push('/(app)/admin')} />
        <Row icon={<Info size={16} color="#6F6E86" />} bg="#EDECF5" title="Audit log" sub="Recent operator actions" onPress={() => router.push('/(app)/admin')} />
      </Card>

      <View style={{ marginTop: 16 }}>
        <Button label="Open full console" onPress={() => router.push('/(app)/admin')} />
      </View>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: color.canvas, paddingTop: insets.top + 10 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink, marginBottom: admin ? 12 : 10 }}>Settings</Text>
        {admin && (
          <>
            <View style={{ flexDirection: 'row', backgroundColor: '#E9E4F1', borderRadius: 12, padding: 3 }}>
              {(['User', 'Admin'] as const).map((t, i) => {
                const on = tab === i;
                return (
                  <Pressable key={t} onPress={() => goTab(i)} style={[{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 9 }, on && { backgroundColor: '#fff' }, on && shadow.card]}>
                    <Text style={{ fontFamily: font.body700, fontSize: 13, color: on ? color.primary : '#8079a6' }}>{t}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={{ textAlign: 'center', fontFamily: font.body600, fontSize: 10.5, color: '#b3a9c6', marginTop: 8, marginBottom: 2 }}>‹ swipe between User & Admin ›</Text>
          </>
        )}
      </View>

      {admin ? (
        <ScrollView ref={pagerRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onPage} scrollEventThrottle={16} style={{ flex: 1, marginTop: 6 }}>
          <View style={{ width }}>{UserPage}</View>
          <View style={{ width }}>{AdminPage}</View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1, marginTop: 6 }}>{UserPage}</View>
      )}

      {/* Appearance picker */}
      <Sheet visible={themeOpen} onClose={() => setThemeOpen(false)} title="Appearance">
        <Card>
          {(['system', 'light', 'dark'] as ThemePref[]).map((t, i) => (
            <ChoiceRow key={t} first={i === 0} label={THEME_LABEL[t]} sub={t === 'system' ? 'Match your device setting' : undefined} selected={prefs.theme === t} onPress={() => { setPref('theme', t); setThemeOpen(false); toast(`Appearance: ${THEME_LABEL[t]}`); }} />
          ))}
        </Card>
        <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted }}>Dark theme rolls out screen-by-screen — your choice is saved now.</Text>
      </Sheet>

      {/* Units & formats picker */}
      <Sheet visible={unitsOpen} onClose={() => setUnitsOpen(false)} title="Units & formats">
        <Text style={{ fontFamily: font.body700, fontSize: 10.5, letterSpacing: 0.8, textTransform: 'uppercase', color: color.muted }}>Measurement</Text>
        <Card>
          {(['metric', 'imperial'] as UnitsPref[]).map((u, i) => (
            <ChoiceRow key={u} first={i === 0} label={u === 'metric' ? 'Metric' : 'Imperial'} sub={UNITS_LABEL[u]} selected={prefs.units === u} onPress={() => setPref('units', u)} />
          ))}
        </Card>
        <Text style={{ fontFamily: font.body700, fontSize: 10.5, letterSpacing: 0.8, textTransform: 'uppercase', color: color.muted }}>Date format</Text>
        <Card>
          {(['dmy', 'mdy', 'iso'] as DateFmt[]).map((d, i) => (
            <ChoiceRow key={d} first={i === 0} label={DATEFMT_LABEL[d]} selected={prefs.dateFormat === d} onPress={() => setPref('dateFormat', d)} />
          ))}
        </Card>
        <Text style={{ fontFamily: font.body700, fontSize: 10.5, letterSpacing: 0.8, textTransform: 'uppercase', color: color.muted }}>Week starts on</Text>
        <Card>
          {(['mon', 'sun'] as WeekStart[]).map((w, i) => (
            <ChoiceRow key={w} first={i === 0} label={WEEKSTART_LABEL[w]} selected={prefs.weekStart === w} onPress={() => setPref('weekStart', w)} />
          ))}
        </Card>
        <Button label="Done" onPress={() => setUnitsOpen(false)} />
      </Sheet>

      {/* Notifications */}
      <Sheet visible={notifOpen} onClose={() => setNotifOpen(false)} title="Notifications">
        <Card>
          <Row first title="Reminders" sub="Appointments, meds & routines" right={<Toggle on={prefs.notifReminders} onPress={() => setPref('notifReminders', !prefs.notifReminders)} />} />
          <Row title="Weekly digest" sub="A Sunday summary of your week" right={<Toggle on={prefs.notifDigest} onPress={() => setPref('notifDigest', !prefs.notifDigest)} />} />
        </Card>
        <Text style={{ fontFamily: font.body400, fontSize: 11, color: color.muted }}>You'll also need to allow notifications in your device settings.</Text>
        <Button label="Done" onPress={() => setNotifOpen(false)} />
      </Sheet>

      {/* About */}
      <Sheet visible={aboutOpen} onClose={() => setAboutOpen(false)} title="About Everly">
        <Text style={{ fontFamily: font.body500, fontSize: 13.5, color: color.inkSecondary }}>Everly {APP_VERSION}</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 12.5, lineHeight: 18, color: color.muted }}>A private, on-device home for your family's memories, health and rhythm.</Text>
        <Card>
          <Row first title="Terms of Service" onPress={() => openLink('https://everly.app/terms', 'everly.app/terms')} />
          <Row title="Privacy Policy" onPress={() => openLink('https://everly.app/privacy', 'everly.app/privacy')} />
          <Row title="Open-source licenses" onPress={() => toast('Licenses coming soon')} />
        </Card>
        <Button label="Close" variant="secondary" onPress={() => setAboutOpen(false)} />
      </Sheet>

      {/* Confirm load sample */}
      <Sheet visible={confirmSample} onClose={() => setConfirmSample(false)} title="Load sample data?">
        <Text style={{ fontFamily: font.body400, fontSize: 13.5, lineHeight: 19, color: color.inkSecondary }}>This replaces what's on this device with a demo family — two children and an active pregnancy — and turns on premium previews. You can clear it anytime.</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label="Cancel" variant="secondary" onPress={() => setConfirmSample(false)} style={{ flex: 1 }} />
          <Button label="Load" onPress={() => { loadSampleData(); setConfirmSample(false); toast('Sample data loaded'); }} style={{ flex: 1 }} />
        </View>
      </Sheet>

      {/* Confirm wipe */}
      <Sheet visible={confirmWipe} onClose={() => setConfirmWipe(false)} title="Clear activity log?">
        <Text style={{ fontFamily: font.body400, fontSize: 13.5, lineHeight: 19, color: color.inkSecondary }}>This removes logged entries and events from this device. Children, health records and milestones are kept.</Text>
        <Notice text="This can't be undone." tone="info" />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label="Cancel" variant="secondary" onPress={() => setConfirmWipe(false)} style={{ flex: 1 }} />
          <Button label="Clear" onPress={() => { clearAll(); setConfirmWipe(false); toast('Activity log cleared'); }} style={{ flex: 1 }} />
        </View>
      </Sheet>
    </View>
  );
}

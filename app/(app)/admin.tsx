import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Splash, Button, Field, Notice } from '../../src/components/forms';
import { ChevronLeft } from '../../src/components/icons';
import { supabase, isAdmin } from '../../src/lib/supabase';

type ConfigRow = { key: string; value: unknown };
type FlagRow = { key: string; enabled: boolean };

/** Operator console — gated by is_admin; reads + edits live thin-server state. */
export default function Admin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [config, setConfig] = useState<ConfigRow[]>([]);
  const [flags, setFlags] = useState<FlagRow[]>([]);
  const [accounts, setAccounts] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [edit, setEdit] = useState<ConfigRow | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const ok = await isAdmin();
      if (!active) return;
      setAdmin(ok);
      if (ok) {
        const [{ data: cfg }, { data: ff }, { count }] = await Promise.all([
          supabase.from('config').select('key,value'),
          supabase.from('feature_flags').select('key,enabled'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
        ]);
        if (!active) return;
        setConfig((cfg as ConfigRow[]) ?? []);
        setFlags((ff as FlagRow[]) ?? []);
        setAccounts(count ?? null);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  async function toggleFlag(key: string, enabled: boolean) {
    setMsg('');
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: !enabled } : f))); // optimistic
    const { error } = await supabase.from('feature_flags').update({ enabled: !enabled }).eq('key', key);
    if (error) {
      setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled } : f))); // revert
      setMsg(`Could not update ${key}: ${error.message}`);
    }
  }

  function openEdit(row: ConfigRow) {
    setEdit(row);
    setDraft(typeof row.value === 'string' ? row.value : JSON.stringify(row.value, null, 2));
  }
  async function saveConfig() {
    if (!edit) return;
    let parsed: unknown = draft;
    try { parsed = JSON.parse(draft); } catch { /* keep as string */ }
    const key = edit.key;
    setMsg('');
    const { error } = await supabase.from('config').update({ value: parsed as never }).eq('key', key);
    if (error) setMsg(`Could not save ${key}: ${error.message}`);
    else setConfig((prev) => prev.map((c) => (c.key === key ? { ...c, value: parsed } : c)));
    setEdit(null);
  }

  if (loading) return <Splash />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Admin</Text>

      {!admin ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 22 }, shadow.card]}>
          <Text style={{ fontFamily: font.body600, fontSize: 15, color: color.ink, marginBottom: 6 }}>Not authorized</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 13.5, color: color.inkSecondary, lineHeight: 20 }}>
            This console is restricted to operator accounts (is_admin). Your account doesn't have an admin role.
          </Text>
        </View>
      ) : (
        <>
          <Notice text={msg} />
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18 }, shadow.card]}>
            <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Accounts</Text>
            <Text style={{ fontFamily: font.display700, fontSize: 34, color: color.ink, marginTop: 4 }}>{accounts ?? '—'}</Text>
          </View>

          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 8 }, shadow.card]}>
            <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted, padding: 10 }}>Feature flags · tap to toggle</Text>
            {flags.map((f, i) => (
              <Pressable key={f.key} onPress={() => toggleFlag(f.key, f.enabled)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: color.hairline }}>
                <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 14, color: color.ink }}>{f.key}</Text>
                <View style={{ width: 46, height: 26, borderRadius: 13, backgroundColor: f.enabled ? color.maternalTeal : color.faint, padding: 3, alignItems: f.enabled ? 'flex-end' : 'flex-start' }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' }} />
                </View>
              </Pressable>
            ))}
          </View>

          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 8 }, shadow.card]}>
            <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted, padding: 10 }}>Live config · tap to edit</Text>
            {config.map((c, i) => (
              <Pressable key={c.key} onPress={() => openEdit(c)} style={{ paddingVertical: 12, paddingHorizontal: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: color.hairline }}>
                <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.ink }}>{c.key}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }} numberOfLines={2}>{JSON.stringify(c.value)}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, lineHeight: 18 }}>
            Changes write live to the thin server (RLS-gated to superadmins) and apply without redeploy.
          </Text>
        </>
      )}

      <Modal visible={edit !== null} transparent animationType="fade" onRequestClose={() => setEdit(null)}>
        <Pressable onPress={() => setEdit(null)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.35)', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Edit {edit?.key}</Text>
            <Field label="Value (JSON or text)" value={draft} onChangeText={setDraft} placeholder="value" autoCapitalize="none" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setEdit(null)} style={{ flex: 1 }} />
              <Button label="Save" onPress={saveConfig} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field, Notice } from '../../src/components/forms';
import { ChevronLeft, ChevronRight, Shield, User, Settings } from '../../src/components/icons';
import { supabase, isAdmin } from '../../src/lib/supabase';

type ConfigRow = { key: string; value: unknown };
type FlagRow = { key: string; enabled: boolean };

const humanize = (k: string) => k.replace(/[_.]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
const valuePreview = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v));

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
      try {
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
      } catch {
        if (active) setAdmin(false);
      } finally {
        if (active) setLoading(false);
      }
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

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: color.canvas, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator color={color.primary} />
        <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>Checking operator access…</Text>
      </View>
    );
  }

  const flagsOn = flags.filter((f) => f.enabled).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 20, gap: 16 }}>
      <Pressable onPress={() => router.back()} hitSlop={8} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
      <View style={{ paddingHorizontal: 2 }}>
        <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink }}>Admin</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, marginTop: 4 }}>Operator console</Text>
      </View>

      {!admin ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 22, gap: 12, alignItems: 'center' }, shadow.card]}>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#FBE0EA', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} color="#B04070" />
          </View>
          <Text style={{ fontFamily: font.body700, fontSize: 16, color: color.ink }}>Not authorized</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 13.5, color: color.inkSecondary, lineHeight: 20, textAlign: 'center' }}>
            This console is restricted to operator accounts. Your account doesn't have an admin role.
          </Text>
        </View>
      ) : (
        <>
          <Notice text={msg} />

          {/* KPI cards */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <Kpi icon={<User size={18} color="#6B6FC9" />} bg="#E7E4FB" label="Accounts" value={accounts ?? '—'} />
            <Kpi icon={<Settings size={18} color="#2C8475" />} bg="#D8F0E6" label="Flags on" value={`${flagsOn}/${flags.length}`} />
            <Kpi icon={<Shield size={18} color="#B5662E" />} bg="#FCE6D8" label="Config keys" value={config.length} />
          </View>

          {/* Feature flags */}
          <Label>Feature flags · tap to toggle</Label>
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, overflow: 'hidden' }, shadow.card]}>
            {flags.length === 0 ? (
              <Empty t="No feature flags." />
            ) : flags.map((f, i) => (
              <Pressable key={f.key} onPress={() => toggleFlag(f.key, f.enabled)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: color.hairline }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }}>{humanize(f.key)}</Text>
                  <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted, marginTop: 2 }} numberOfLines={1}>{f.key}</Text>
                </View>
                <View style={{ width: 46, height: 27, borderRadius: 14, backgroundColor: f.enabled ? color.maternalTeal : color.faint, padding: 3, alignItems: f.enabled ? 'flex-end' : 'flex-start', justifyContent: 'center' }}>
                  <View style={{ width: 21, height: 21, borderRadius: 11, backgroundColor: '#fff' }} />
                </View>
              </Pressable>
            ))}
          </View>

          {/* Live config */}
          <Label>Live config · tap to edit</Label>
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, overflow: 'hidden' }, shadow.card]}>
            {config.length === 0 ? (
              <Empty t="No config keys." />
            ) : config.map((c, i) => (
              <Pressable key={c.key} onPress={() => openEdit(c)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: color.hairline }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 13.5, color: color.ink }}>{c.key}</Text>
                  <Text style={{ fontFamily: 'monospace', fontSize: 12, color: color.muted, marginTop: 3 }} numberOfLines={2}>{valuePreview(c.value)}</Text>
                </View>
                <ChevronRight size={18} color={color.faint} />
              </Pressable>
            ))}
          </View>

          <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, lineHeight: 18, paddingHorizontal: 2 }}>
            Changes write live to the thin server (RLS-gated to superadmins) and apply without redeploy.
          </Text>
        </>
      )}

      <Modal visible={edit !== null} transparent animationType="fade" onRequestClose={() => setEdit(null)}>
        <Pressable onPress={() => setEdit(null)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.4)', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 14 }, shadow.card]}>
            <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>Edit config</Text>
            <Text style={{ fontFamily: 'monospace', fontSize: 13, color: color.primary }}>{edit?.key}</Text>
            <Field label="Value (JSON or text)" value={draft} onChangeText={setDraft} placeholder="value" autoCapitalize="none" multiline numberOfLines={6} monospace />
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

function Kpi({ icon, bg, label, value }: { icon: React.ReactNode; bg: string; label: string; value: string | number }) {
  return (
    <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, gap: 8, flexGrow: 1, flexBasis: '30%', minWidth: 100 }, shadow.card]}>
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <Text style={{ fontFamily: font.display700, fontSize: 24, color: color.ink }}>{value}</Text>
      <Text style={{ fontFamily: font.body600, fontSize: 11, color: color.muted }} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted, paddingLeft: 2 }}>{children}</Text>;
}

function Empty({ t }: { t: string }) {
  return <View style={{ padding: 18, alignItems: 'center' }}><Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>{t}</Text></View>;
}

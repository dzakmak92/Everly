import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Splash } from '../../src/components/forms';
import { ChevronLeft } from '../../src/components/icons';
import { supabase, isAdmin } from '../../src/lib/supabase';

type ConfigRow = { key: string; value: unknown };
type FlagRow = { key: string; enabled: boolean };

/** Operator console — gated by the is_admin RBAC check; reads live thin-server state. */
export default function Admin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [config, setConfig] = useState<ConfigRow[]>([]);
  const [flags, setFlags] = useState<FlagRow[]>([]);
  const [accounts, setAccounts] = useState<number | null>(null);

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

  if (loading) return <Splash />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 22, gap: 16 }}
    >
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
        <ChevronLeft size={24} color={color.ink} />
      </Pressable>
      <Text style={{ fontFamily: font.display700, fontSize: 28, color: color.ink }}>Admin</Text>

      {!admin ? (
        <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 22 }, shadow.card]}>
          <Text style={{ fontFamily: font.body600, fontSize: 15, color: color.ink, marginBottom: 6 }}>Not authorized</Text>
          <Text style={{ fontFamily: font.body400, fontSize: 13.5, color: color.inkSecondary, lineHeight: 20 }}>
            This console is restricted to operator accounts (is_admin). Your account
            doesn't have an admin role.
          </Text>
        </View>
      ) : (
        <>
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18 }, shadow.card]}>
            <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted }}>Accounts</Text>
            <Text style={{ fontFamily: font.display700, fontSize: 34, color: color.ink, marginTop: 4 }}>{accounts ?? '—'}</Text>
          </View>

          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 8 }, shadow.card]}>
            <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted, padding: 10 }}>Feature flags</Text>
            {flags.map((f, i) => (
              <View key={f.key} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: color.hairline }}>
                <Text style={{ flex: 1, fontFamily: font.body600, fontSize: 14, color: color.ink }}>{f.key}</Text>
                <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: f.enabled ? '#D8F0E6' : color.canvas }}>
                  <Text style={{ fontFamily: font.body700, fontSize: 11, color: f.enabled ? color.tealInk : color.muted }}>{f.enabled ? 'ON' : 'OFF'}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 8 }, shadow.card]}>
            <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: color.muted, padding: 10 }}>Live config</Text>
            {config.map((c, i) => (
              <View key={c.key} style={{ paddingVertical: 12, paddingHorizontal: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: color.hairline }}>
                <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.ink }}>{c.key}</Text>
                <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }} numberOfLines={2}>
                  {JSON.stringify(c.value)}
                </Text>
              </View>
            ))}
          </View>
          <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, lineHeight: 18 }}>
            Read-only view of the live thin-server. Editing controls come next.
          </Text>
        </>
      )}
    </ScrollView>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font, radius, shadow } from '../../src/theme/tokens';
import { Button, Field, Notice } from '../../src/components/forms';
import { ChevronLeft, ChevronRight, Shield, User, Settings, Search, Star, Activity } from '../../src/components/icons';
import { supabase, isAdmin } from '../../src/lib/supabase';

type ConfigRow = { key: string; value: unknown };
type FlagRow = { key: string; enabled: boolean };
type Profile = { id: string; email: string | null; name: string | null; plan: string; sub_status: string; trial_ends_at: string | null; created_at: string; suspended: boolean };
type AuditRow = { id: number; at: string; actor_admin_id: string | null; actor_role: string | null; action: string; subject_user_id: string | null; ip: string | null };

const TABS = ['Overview', 'Users', 'Billing', 'Config', 'Audit'] as const;
type Tab = (typeof TABS)[number];

const humanize = (k: string) => k.replace(/[_.]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
const valuePreview = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v));
const shortDate = (iso?: string | null) => { if (!iso) return '—'; const d = new Date(iso); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); };
const dateTime = (iso: string) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? iso : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); };

const PLAN_C: Record<string, { bg: string; fg: string }> = {
  free: { bg: '#EDECF5', fg: '#6F6E86' }, pro: { bg: '#E7E4FB', fg: '#54579E' },
  family: { bg: '#D8F0E6', fg: '#2C8475' }, lifetime: { bg: '#FBF1CE', fg: '#9A7B1F' },
};
const STATUS_C: Record<string, { bg: string; fg: string }> = {
  active: { bg: '#D8F0E6', fg: '#2C8475' }, trialing: { bg: '#E7E4FB', fg: '#54579E' },
  past_due: { bg: '#FBE0EA', fg: '#C0436E' }, unpaid: { bg: '#FBE0EA', fg: '#C0436E' },
  canceled: { bg: '#EDECF5', fg: '#6F6E86' }, none: { bg: '#EDECF5', fg: '#9C9AB2' },
  paused: { bg: '#FCE6D8', fg: '#B5662E' },
};
const planC = (p: string) => PLAN_C[p] ?? PLAN_C.free;
const statusC = (s: string) => STATUS_C[s] ?? STATUS_C.none;
const isDunning = (s: string) => s === 'past_due' || s === 'unpaid';

/** Operator console — gated by is_admin; reads + edits live thin-server state. */
export default function Admin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [tab, setTab] = useState<Tab>('Overview');
  const [config, setConfig] = useState<ConfigRow[]>([]);
  const [flags, setFlags] = useState<FlagRow[]>([]);
  const [accounts, setAccounts] = useState<number | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [msg, setMsg] = useState('');
  const [edit, setEdit] = useState<ConfigRow | null>(null);
  const [draft, setDraft] = useState('');
  const [viewUser, setViewUser] = useState<Profile | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const ok = await isAdmin();
        if (!active) return;
        setAdmin(ok);
        if (ok) {
          const [{ data: cfg }, { data: ff }, { count }, { data: pf }, { data: al }] = await Promise.all([
            supabase.from('config').select('key,value'),
            supabase.from('feature_flags').select('key,enabled'),
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('id,email,name,plan,sub_status,trial_ends_at,created_at,suspended').order('created_at', { ascending: false }).limit(500),
            supabase.from('audit_log').select('id,at,actor_admin_id,actor_role,action,subject_user_id,ip').order('at', { ascending: false }).limit(50),
          ]);
          if (!active) return;
          setConfig((cfg as ConfigRow[]) ?? []);
          setFlags((ff as FlagRow[]) ?? []);
          setAccounts(count ?? null);
          setProfiles((pf as Profile[]) ?? []);
          setAudit((al as AuditRow[]) ?? []);
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
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: !enabled } : f)));
    const { error } = await supabase.from('feature_flags').update({ enabled: !enabled }).eq('key', key);
    if (error) { setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled } : f))); setMsg(`Could not update ${key}: ${error.message}`); }
  }
  function openEdit(row: ConfigRow) { setEdit(row); setDraft(typeof row.value === 'string' ? row.value : JSON.stringify(row.value, null, 2)); }
  async function saveConfig() {
    if (!edit) return;
    let parsed: unknown = draft;
    try { parsed = JSON.parse(draft); } catch { /* keep as string */ }
    const key = edit.key; setMsg('');
    const { error } = await supabase.from('config').update({ value: parsed as never }).eq('key', key);
    if (error) setMsg(`Could not save ${key}: ${error.message}`);
    else setConfig((prev) => prev.map((c) => (c.key === key ? { ...c, value: parsed } : c)));
    setEdit(null);
  }
  async function toggleSuspend(p: Profile) {
    setMsg('');
    const next = !p.suspended;
    setProfiles((prev) => prev.map((x) => (x.id === p.id ? { ...x, suspended: next } : x)));
    setViewUser((v) => (v && v.id === p.id ? { ...v, suspended: next } : v));
    const { error } = await supabase.from('profiles').update({ suspended: next }).eq('id', p.id);
    if (error) { setProfiles((prev) => prev.map((x) => (x.id === p.id ? { ...x, suspended: p.suspended } : x))); setMsg(`Could not update account: ${error.message}`); }
  }

  const stats = useMemo(() => {
    const by = (pred: (p: Profile) => boolean) => profiles.filter(pred).length;
    const mix = { free: 0, pro: 0, family: 0, lifetime: 0 } as Record<string, number>;
    profiles.forEach((p) => { mix[p.plan] = (mix[p.plan] ?? 0) + 1; });
    return {
      total: accounts ?? profiles.length,
      active: by((p) => p.sub_status === 'active'),
      trialing: by((p) => p.sub_status === 'trialing'),
      dunning: by((p) => isDunning(p.sub_status)),
      mix,
    };
  }, [profiles, accounts]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? profiles.filter((p) => (p.email || '').toLowerCase().includes(q) || (p.name || '').toLowerCase().includes(q) || p.id.includes(q)) : profiles;
  }, [profiles, query]);

  const dunningQueue = useMemo(() => profiles.filter((p) => isDunning(p.sub_status)), [profiles]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: color.canvas, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator color={color.primary} />
        <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>Checking operator access…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: color.canvas, paddingTop: insets.top + 8 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ width: 40, height: 40, justifyContent: 'center' }}><ChevronLeft size={24} color={color.ink} /></Pressable>
        <Text style={{ fontFamily: font.display700, fontSize: 26, color: color.ink, paddingHorizontal: 2 }}>Admin</Text>
        <Text style={{ fontFamily: font.body400, fontSize: 13, color: color.muted, marginTop: 4, paddingHorizontal: 2 }}>Operator console</Text>
      </View>

      {!admin ? (
        <View style={{ padding: 20 }}>
          <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 22, gap: 12, alignItems: 'center' }, shadow.card]}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#FBE0EA', alignItems: 'center', justifyContent: 'center' }}><Shield size={24} color="#B04070" /></View>
            <Text style={{ fontFamily: font.body700, fontSize: 16, color: color.ink }}>Not authorized</Text>
            <Text style={{ fontFamily: font.body400, fontSize: 13.5, color: color.inkSecondary, lineHeight: 20, textAlign: 'center' }}>
              This console is restricted to operator accounts. Your account doesn't have an admin role.
            </Text>
          </View>
        </View>
      ) : (
        <>
          {/* tab switcher */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginTop: 14 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
            {TABS.map((t) => {
              const a = t === tab;
              return (
                <Pressable key={t} onPress={() => setTab(t)} style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: a ? color.primary : '#fff', borderWidth: a ? 0 : 1, borderColor: color.hairline }}>
                  <Text style={{ fontFamily: a ? font.body700 : font.body600, fontSize: 13, color: a ? '#fff' : color.inkSecondary }}>{t}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: insets.bottom + 28, gap: 14 }} showsVerticalScrollIndicator={false}>
            <Notice text={msg} />

            {tab === 'Overview' && (
              <>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  <Kpi icon={<User size={18} color="#6B6FC9" />} bg="#E7E4FB" label="Accounts" value={stats.total} />
                  <Kpi icon={<Activity size={18} color="#2C8475" />} bg="#D8F0E6" label="Active subs" value={stats.active} />
                  <Kpi icon={<Star size={18} color="#9A7B1F" />} bg="#FBF1CE" label="Trialing" value={stats.trialing} />
                  <Kpi icon={<Shield size={18} color="#C0436E" />} bg="#FBE0EA" label="Dunning" value={stats.dunning} />
                </View>
                <Label>Plan mix</Label>
                <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 16, gap: 12 }, shadow.card]}>
                  {(['free', 'pro', 'family', 'lifetime'] as const).map((p) => {
                    const n = stats.mix[p] ?? 0; const pct = profiles.length ? Math.round((n / profiles.length) * 100) : 0;
                    return (
                      <View key={p} style={{ gap: 5 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontFamily: font.body600, fontSize: 13, color: color.ink, textTransform: 'capitalize' }}>{p}</Text>
                          <Text style={{ fontFamily: font.body600, fontSize: 12, color: color.muted }}>{n} · {pct}%</Text>
                        </View>
                        <View style={{ height: 8, borderRadius: 4, backgroundColor: color.hairline, overflow: 'hidden' }}>
                          <View style={{ width: `${pct}%`, height: 8, borderRadius: 4, backgroundColor: planC(p).fg }} />
                        </View>
                      </View>
                    );
                  })}
                  {profiles.length === 0 ? <Text style={{ fontFamily: font.body400, fontSize: 12.5, color: color.muted }}>No accounts yet.</Text> : null}
                </View>
                <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted, lineHeight: 17, paddingHorizontal: 2 }}>
                  Counts from the latest {Math.min(profiles.length, 500)} accounts. Revenue figures live in Stripe.
                </Text>
              </>
            )}

            {tab === 'Users' && (
              <>
                <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: radius.tile, paddingHorizontal: 12 }, shadow.card]}>
                  <Search size={16} color={color.muted} />
                  <TextInput value={query} onChangeText={setQuery} placeholder="Search by email, name or ID" placeholderTextColor={color.faint} autoCapitalize="none" style={{ flex: 1, paddingVertical: 12, fontFamily: font.body500, fontSize: 14, color: color.ink }} />
                </View>
                {filteredUsers.length === 0 ? <Empty t={query ? 'No matching accounts.' : 'No accounts yet.'} /> : (
                  <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, overflow: 'hidden' }, shadow.card]}>
                    {filteredUsers.slice(0, 100).map((p, i) => (
                      <Pressable key={p.id} onPress={() => setViewUser(p)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: color.hairline }}>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }} numberOfLines={1}>{p.name || p.email || p.id.slice(0, 8)}</Text>
                          <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }} numberOfLines={1}>{p.email || '—'} · joined {shortDate(p.created_at)}</Text>
                        </View>
                        <Pill {...planC(p.plan)} text={p.plan} />
                        {p.suspended ? <Pill bg="#FBE0EA" fg="#C0436E" text="suspended" /> : null}
                        <ChevronRight size={16} color={color.faint} />
                      </Pressable>
                    ))}
                  </View>
                )}
                {filteredUsers.length > 100 ? <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted, paddingHorizontal: 2 }}>Showing first 100 of {filteredUsers.length}.</Text> : null}
              </>
            )}

            {tab === 'Billing' && (
              <>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  <Kpi icon={<Shield size={18} color="#C0436E" />} bg="#FBE0EA" label="Dunning queue" value={stats.dunning} />
                  <Kpi icon={<Activity size={18} color="#2C8475" />} bg="#D8F0E6" label="Active subs" value={stats.active} />
                  <Kpi icon={<Star size={18} color="#9A7B1F" />} bg="#FBF1CE" label="Trialing" value={stats.trialing} />
                </View>
                <Label>Dunning queue · payment failing</Label>
                {dunningQueue.length === 0 ? <Empty t="No failing payments. 🎉" /> : (
                  <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, overflow: 'hidden' }, shadow.card]}>
                    {dunningQueue.map((p, i) => (
                      <Pressable key={p.id} onPress={() => setViewUser(p)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: color.hairline }}>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{ fontFamily: font.body700, fontSize: 14, color: color.ink }} numberOfLines={1}>{p.name || p.email || p.id.slice(0, 8)}</Text>
                          <Text style={{ fontFamily: font.body400, fontSize: 12, color: color.muted, marginTop: 2 }} numberOfLines={1}>{p.email || '—'}</Text>
                        </View>
                        <Pill {...planC(p.plan)} text={p.plan} />
                        <Pill {...statusC(p.sub_status)} text={p.sub_status.replace('_', ' ')} />
                      </Pressable>
                    ))}
                  </View>
                )}
                <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted, lineHeight: 17, paddingHorizontal: 2 }}>
                  Transactions & retries are managed in Stripe; this mirrors subscription status via the webhook.
                </Text>
              </>
            )}

            {tab === 'Config' && (
              <>
                <Label>Feature flags · tap to toggle</Label>
                <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, overflow: 'hidden' }, shadow.card]}>
                  {flags.length === 0 ? <Empty t="No feature flags." /> : flags.map((f, i) => (
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
                <Label>Live config · tap to edit</Label>
                <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, overflow: 'hidden' }, shadow.card]}>
                  {config.length === 0 ? <Empty t="No config keys." /> : config.map((c, i) => (
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

            {tab === 'Audit' && (
              <>
                <Label>Audit log · latest {audit.length}</Label>
                {audit.length === 0 ? <Empty t="No audit entries yet." /> : (
                  <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, overflow: 'hidden' }, shadow.card]}>
                    {audit.map((a, i) => (
                      <View key={a.id} style={{ gap: 4, padding: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: color.hairline }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Pill bg="#E7E4FB" fg="#54579E" text={a.action} />
                          {a.actor_role ? <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted }}>{a.actor_role}</Text> : null}
                          <Text style={{ flex: 1, textAlign: 'right', fontFamily: font.body400, fontSize: 11, color: color.muted }}>{dateTime(a.at)}</Text>
                        </View>
                        <Text style={{ fontFamily: 'monospace', fontSize: 11.5, color: color.inkSecondary }} numberOfLines={1}>
                          {a.subject_user_id ? `→ ${a.subject_user_id.slice(0, 12)}…` : '—'}{a.ip ? `  ${a.ip}` : ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                <Text style={{ fontFamily: font.body400, fontSize: 11.5, color: color.muted, lineHeight: 17, paddingHorizontal: 2 }}>
                  Append-only · immutable. Every admin action is logged here for accountability.
                </Text>
              </>
            )}
          </ScrollView>
        </>
      )}

      {/* config edit modal */}
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

      {/* user detail modal */}
      <Modal visible={viewUser !== null} transparent animationType="fade" onRequestClose={() => setViewUser(null)}>
        <Pressable onPress={() => setViewUser(null)} style={{ flex: 1, backgroundColor: 'rgba(40,18,50,0.4)', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Pressable onPress={() => {}} style={[{ backgroundColor: color.canvas, borderRadius: radius.card, padding: 20, gap: 12 }, shadow.card]}>
            {viewUser ? (
              <>
                <Text style={{ fontFamily: font.display700, fontSize: 18, color: color.ink }}>{viewUser.name || viewUser.email || 'Account'}</Text>
                <Text style={{ fontFamily: 'monospace', fontSize: 12, color: color.muted }}>{viewUser.id}</Text>
                <KV k="Email" v={viewUser.email || '—'} />
                <KV k="Plan" v={viewUser.plan} />
                <KV k="Status" v={viewUser.sub_status.replace('_', ' ')} />
                <KV k="Trial ends" v={shortDate(viewUser.trial_ends_at)} />
                <KV k="Joined" v={shortDate(viewUser.created_at)} />
                <KV k="Suspended" v={viewUser.suspended ? 'Yes' : 'No'} />
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                  <Button label="Close" variant="secondary" onPress={() => setViewUser(null)} style={{ flex: 1 }} />
                  <Button label={viewUser.suspended ? 'Unsuspend' : 'Suspend'} onPress={() => toggleSuspend(viewUser)} style={{ flex: 1 }} />
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
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
function Pill({ bg, fg, text }: { bg: string; fg: string; text: string }) {
  return <View style={{ backgroundColor: bg, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 9 }}><Text style={{ fontFamily: font.body700, fontSize: 10.5, color: fg, textTransform: 'capitalize' }}>{text}</Text></View>;
}
function KV({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>{k}</Text>
      <Text style={{ fontFamily: font.body700, fontSize: 13, color: color.ink, textTransform: 'capitalize', maxWidth: '60%' }} numberOfLines={1}>{v}</Text>
    </View>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: font.body700, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color.muted, paddingLeft: 2 }}>{children}</Text>;
}
function Empty({ t }: { t: string }) {
  return <View style={[{ backgroundColor: '#fff', borderRadius: radius.card, padding: 18, alignItems: 'center' }, shadow.card]}><Text style={{ fontFamily: font.body500, fontSize: 13, color: color.muted }}>{t}</Text></View>;
}

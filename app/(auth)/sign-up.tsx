import React, { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font } from '../../src/theme/tokens';
import { Button, Field, Notice } from '../../src/components/forms';
import { ChevronLeft } from '../../src/components/icons';
import { signUp } from '../../src/lib/supabase';

export default function SignUp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function onSubmit() {
    setError('');
    setInfo('');
    if (!email || !password) {
      setError('Enter an email and password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    const { data, error } = await signUp({ email: email.trim(), password, name: name.trim() || undefined });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    // If the project requires email confirmation, there's no session yet.
    if (!data.session) {
      setInfo('Account created. Check your email to confirm, then sign in.');
      return;
    }
    router.replace('/(app)');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: color.canvas }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28, paddingHorizontal: 28 }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
          <ChevronLeft size={24} color={color.ink} />
        </Pressable>

        <Text style={{ fontFamily: font.display700, fontSize: 30, color: color.ink, marginTop: 12, marginBottom: 6 }}>
          Create your account
        </Text>
        <Text style={{ fontFamily: font.body400, fontSize: 15, color: color.inkSecondary, marginBottom: 26 }}>
          Free forever. Your family's data stays on your device.
        </Text>

        <View style={{ gap: 16 }}>
          <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" autoComplete="name" />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry autoComplete="password" />
          <Notice text={error} />
          <Notice text={info} tone="info" />
          <Button label="Create account" onPress={onSubmit} loading={busy} />
        </View>

        <Pressable onPress={() => router.replace('/(auth)/sign-in')} style={{ alignItems: 'center', paddingTop: 20 }}>
          <Text style={{ fontFamily: font.body600, fontSize: 14, color: color.primary }}>
            Already have an account? Sign in
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

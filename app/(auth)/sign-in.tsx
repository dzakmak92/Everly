import React, { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, font } from '../../src/theme/tokens';
import { Button, Field, Notice } from '../../src/components/forms';
import { ChevronLeft } from '../../src/components/icons';
import { signIn } from '../../src/lib/supabase';

export default function SignIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit() {
    setError('');
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    const { error } = await signIn({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Session change is observed by the provider; the (app) guard takes over.
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
          Welcome back
        </Text>
        <Text style={{ fontFamily: font.body400, fontSize: 15, color: color.inkSecondary, marginBottom: 26 }}>
          Sign in to your Everly account.
        </Text>

        <View style={{ gap: 16 }}>
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry autoComplete="password" />
          <Notice text={error} />
          <Button label="Sign in" onPress={onSubmit} loading={busy} />
        </View>

        <Pressable onPress={() => router.replace('/(auth)/sign-up')} style={{ alignItems: 'center', paddingTop: 20 }}>
          <Text style={{ fontFamily: font.body600, fontSize: 14, color: color.primary }}>
            New here? Create an account
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

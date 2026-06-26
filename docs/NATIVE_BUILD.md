# Everly — Native build (EAS) guide

The web app is fully deployed. To ship the **device-only features** (camera, photos,
audio, PDF, push notifications, voice) and install Everly on a real phone, you need a
native build via **EAS**. EAS runs on Expo's servers and needs your Expo login — it
can't run from the Claude sandbox (Expo's hosts are firewalled here), so run these on
your own machine.

## One-time setup
```bash
npm install -g eas-cli            # or: npx eas-cli@latest
cd Everly
eas login                         # your Expo account
eas init                          # creates the project + writes extra.eas.projectId to app.json
```

`eas.json` is already in the repo with three profiles:
- **development** — dev client for fast iteration (`expo-dev-client`)
- **preview** — internal install build (Android APK / iOS ad-hoc)
- **production** — store builds, auto-incrementing version

App identifiers are set in `app.json`:
- iOS `bundleIdentifier`: `com.everly.mumandme`
- Android `package`: `com.everly.mumandme`

## First build (easiest: Android APK you can sideload)
```bash
eas build --profile preview --platform android
```
When it finishes, EAS gives you a URL + QR to install the APK on your phone.
For iOS you'll need an Apple Developer account: `eas build --profile preview --platform ios`.

## Live JS updates (no rebuild) — optional
```bash
npm install eas-cli && eas update:configure
eas update --branch preview -m "tweak"
```

---

## Implementing the remaining native features
Each needs a package + a small wiring change. Add the package, rebuild a dev/preview
build, then implement. Suggested order:

1. **Push notifications** (`expo-notifications`)
   - Wake-window, vaccine/med, appointment, weekly digest reminders.
   - Add a `NotificationProvider` that requests permission and schedules local
     notifications from the existing events/vaccines/appointments data.

2. **Camera & photos** (`expo-camera`, `expo-image-picker`)
   - P05 Safety scanner (barcode), P08 bump photos, A10/A06 milestone & profile
     photos. Store image URIs in the existing on-device records.

3. **PDF & share** (`expo-print`, `expo-sharing`)
   - Health Hub pediatrician PDF (A05/P14/M08). Generate HTML from the on-device
     data and `Print.printToFileAsync` → `Sharing.shareAsync`.

4. **Audio** (`expo-av`)
   - P10 Calm layer player. Needs bundled or streamed audio assets.

5. **Voice capture** (`expo-speech-recognition` or a cloud ASR)
   - Upgrade `quick-add`'s text parser with real speech-to-text + the existing
     command parser.

## Backend-only (separate from native)
- **Co-parent / partner real-time sync** — the `relay_records` (ciphertext) table
  already exists; wire invites + an E2E relay and Supabase Realtime.
- **Marketing site** — pick the L3 direction, build responsive + SEO, deploy
  (already have the GitHub Pages / Vercel pipeline).

## Notes
- Permissions: when you add camera/photos/notifications, add the matching iOS
  usage strings + Android permissions via each package's config plugin in
  `app.json` `plugins`.
- The web build keeps working — these packages no-op or are guarded on web.

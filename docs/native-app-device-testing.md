# Testing the native app on a device

Capacitor wrap is #162. Store signing is later (#167–#173).

Native builds must use the default Vite `/` base. GitHub Pages uses
`--base=/my-money/`. Do **not** `npx cap sync` from a Pages `dist/`.

```bash
npm run cap:sync
```

(`npm run build && npx cap sync` — web assets are copied into `android/` and
`ios/`, then gitignored there.)

This only produces **debug** builds. Play / TestFlight signing is later.

## Android — Windows is enough

1. Phone: Developer options → USB debugging. Allow this computer.
2. `adb devices` (`%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe`).
3. First time: `android/local.properties` with `sdk.dir=` pointing at the SDK
   (gitignored). Android Studio writes this when you open the project.
4. From `android/`:

   ```
   JAVA_HOME="C:\Program Files\Android\Android Studio\jbr" ./gradlew.bat assembleDebug
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   adb shell am start -n io.github.zhannam85.mymoney/.MainActivity
   ```

5. Confirm the app loads and a saved amount survives an app restart.
6. From Settings, Back should land on Dashboard, not exit. From Dashboard with
   no history, Back should exit. Tab hops must not pile up on the back stack.
7. Export JSON/CSV should open the share sheet (or save a file). Import should
   open the system picker; JSON restore still requires an empty book.

`npx cap open android` if you prefer Android Studio.

Regenerate native icons/splash from `resources/icon.png` (do not touch `public/` PWA icons):

```
npx capacitor-assets generate --android --ios --iconBackgroundColor "#1b2a41" --iconBackgroundColorDark "#1b2a41" --splashBackgroundColor "#f8faf8" --splashBackgroundColorDark "#1b2a41" --logoSplashScale 0.65
```

## iOS — Mac + Xcode

`ios/` is generated and committed. Building, signing, and TestFlight need a
Mac (#168). A free Apple ID is enough for a USB debug install; TestFlight
needs the paid Developer Program (already enrolled) plus #167.

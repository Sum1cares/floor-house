#!/bin/sh
# Build a Play-ready Android App Bundle when the Android SDK is present.
# The upload keystore is local — never committed.
set -eu
cd "$(dirname "$0")/.."

if [ -z "${ANDROID_HOME:-}${ANDROID_SDK_ROOT:-}" ]; then
  echo "Android SDK is not on this machine. Install Android Studio or command-line tools,"
  echo "set ANDROID_HOME, then re-run: npm run android:bundle"
  echo "The AAB is what Play Console uploads — APKs are rejected for new apps."
  exit 1
fi

STORE="${FLOOR_UPLOAD_STORE_FILE:-android/keystore/upload.jks}"
if [ ! -f "$STORE" ]; then
  echo "No upload keystore at $STORE"
  echo "Create one (do not commit it):"
  echo "  mkdir -p android/keystore"
  echo "  keytool -genkeypair -v -keystore android/keystore/upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload"
  exit 1
fi

export FLOOR_UPLOAD_STORE_FILE="$(pwd)/$STORE"
SDK="${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
printf 'sdk.dir=%s\n' "$SDK" > android/local.properties

npx cap sync android
cd android
./gradlew bundleRelease
echo "AAB: android/app/build/outputs/bundle/release/app-release.aab"

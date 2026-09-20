import type { CapacitorConfig } from "@capacitor/cli";

const live = process.env.FLOOR_NATIVE_URL ?? "https://floor-house.vercel.app";

const config: CapacitorConfig = {
  appId: "house.floor.app",
  appName: "FLOOR",
  webDir: "native/www",
  server: {
    url: live,
    cleartext: false,
    androidScheme: "https",
    iosScheme: "https",
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#0a0a0b",
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#0a0a0b",
    preferredContentMode: "mobile",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#0a0a0b",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0a0b",
    },
    Keyboard: {
      resize: "body",
    },
  },
};

export default config;

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.memonotes.app',
  appName: 'MemoNotes',
  webDir: 'public',
  server: {
    url: 'http://localhost:3000', 
    cleartext: true,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
    },
    Geolocation: {
      permissions: [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
      ],
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
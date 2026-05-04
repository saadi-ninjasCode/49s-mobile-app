const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const SOURCE = path.join('assets', 'images', 'notification-icon.xml');
const META_ICON_NAME = 'com.google.firebase.messaging.default_notification_icon';
const ICON_RESOURCE = '@drawable/ic_notification';

const STALE_PNG_BUCKETS = [
  'drawable',
  'drawable-mdpi',
  'drawable-hdpi',
  'drawable-xhdpi',
  'drawable-xxhdpi',
  'drawable-xxxhdpi',
];

const withCopyIcon = config =>
  withDangerousMod(config, [
    'android',
    async cfg => {
      const projectRoot = cfg.modRequest.projectRoot;
      const platformRoot = cfg.modRequest.platformProjectRoot;
      const src = path.join(projectRoot, SOURCE);

      if (!fs.existsSync(src)) {
        throw new Error(`withNotificationIcon: source not found at ${src}`);
      }

      const resRoot = path.join(platformRoot, 'app', 'src', 'main', 'res');

      for (const bucket of STALE_PNG_BUCKETS) {
        const stale = path.join(resRoot, bucket, 'ic_notification.png');
        if (fs.existsSync(stale)) fs.rmSync(stale);
      }

      const dest = path.join(resRoot, 'drawable', 'ic_notification.xml');
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      return cfg;
    },
  ]);

const withFcmIconMetaData = (config) =>
  withAndroidManifest(config, (cfg) => {
    const application = cfg.modResults.manifest.application?.[0];
    if (!application) return cfg;
    application['meta-data'] = application['meta-data'] || [];
    const existing = application['meta-data'].find(
      (m) => m.$?.['android:name'] === META_ICON_NAME,
    );
    if (existing) {
      existing.$['android:resource'] = ICON_RESOURCE;
    } else {
      application['meta-data'].push({
        $: {
          'android:name': META_ICON_NAME,
          'android:resource': ICON_RESOURCE,
        },
      });
    }
    return cfg;
  });

const withNotificationIcon = (config) => {
  config = withCopyIcon(config);
  config = withFcmIconMetaData(config);
  return config;
};

module.exports = withNotificationIcon;

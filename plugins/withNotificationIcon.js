const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const SOURCE = path.join('assets', 'images', 'notification-icon.png');
const TARGET_RELATIVE = path.join(
  'app',
  'src',
  'main',
  'res',
  'drawable-xxxhdpi',
  'ic_notification.png',
);

const withNotificationIcon = (config) => {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const platformRoot = cfg.modRequest.platformProjectRoot;
      const src = path.join(projectRoot, SOURCE);
      const dest = path.join(platformRoot, TARGET_RELATIVE);

      if (!fs.existsSync(src)) {
        throw new Error(`withNotificationIcon: source not found at ${src}`);
      }

      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      return cfg;
    },
  ]);
};

module.exports = withNotificationIcon;

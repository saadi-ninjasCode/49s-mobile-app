const { withGradleProperties, withAppBuildGradle } = require('expo/config-plugins');

const SPLITS_BLOCK = `    splits {
        abi {
            enable true
            reset()
            include "arm64-v8a", "armeabi-v7a"
            universalApk false
        }
    }`;

const setProperty = (modResults, key, value) => {
  const idx = modResults.findIndex((p) => p.type === 'property' && p.key === key);
  const next = { type: 'property', key, value };
  if (idx >= 0) modResults[idx] = next;
  else modResults.push(next);
};

const withApkSizeTweaks = (config) => {
  config = withGradleProperties(config, (cfg) => {
    setProperty(cfg.modResults, 'expo.gif.enabled', 'false');
    return cfg;
  });

  config = withAppBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes('splits {')) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /(androidResources\s*\{[^}]*\})/,
        `$1\n${SPLITS_BLOCK}`,
      );
    }
    return cfg;
  });

  return config;
};

module.exports = withApkSizeTweaks;

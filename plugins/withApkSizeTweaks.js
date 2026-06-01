const { withGradleProperties, withAppBuildGradle } = require('expo/config-plugins');

// ABI splits must be disabled when building an AAB — AGP's resource shrinker
// produces one shrunk-resources file per ABI, and the bundle merger errors with
// "Multiple shrunk-resources files found" (issuetracker.google.com/402800800).
// Gate on the task name so:
//   ./gradlew assembleRelease  → splits enabled  → per-ABI APKs
//   ./gradlew bundleRelease    → splits disabled → single AAB (Play Store slices by ABI itself)
const SPLITS_BLOCK = `    def isBundleBuild = gradle.startParameter.taskNames.any { it.toLowerCase().contains("bundle") }
    splits {
        abi {
            enable !isBundleBuild
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
    setProperty(cfg.modResults, 'EX_DEV_CLIENT_NETWORK_INSPECTOR', 'false');
    setProperty(cfg.modResults, 'android.enableR8.fullMode', 'true');
    setProperty(cfg.modResults, 'android.enableBundleCompression', 'true');
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

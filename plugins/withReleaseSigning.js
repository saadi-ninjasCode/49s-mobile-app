const {
  withGradleProperties,
  withAppBuildGradle,
} = require('expo/config-plugins');

const setProperty = (modResults, key, value) => {
  const idx = modResults.findIndex((p) => p.type === 'property' && p.key === key);
  const next = { type: 'property', key, value };
  if (idx >= 0) modResults[idx] = next;
  else modResults.push(next);
};

const RELEASE_PROPS_BLOCK = `def releaseStoreFile = (findProperty("MYAPP_UPLOAD_STORE_FILE") ?: System.getenv("MYAPP_UPLOAD_STORE_FILE") ?: "").trim()
def releaseStorePassword = (findProperty("MYAPP_UPLOAD_STORE_PASSWORD") ?: System.getenv("MYAPP_UPLOAD_STORE_PASSWORD") ?: "").trim()
def releaseKeyAlias = (findProperty("MYAPP_UPLOAD_KEY_ALIAS") ?: System.getenv("MYAPP_UPLOAD_KEY_ALIAS") ?: "").trim()
def releaseKeyPassword = (findProperty("MYAPP_UPLOAD_KEY_PASSWORD") ?: System.getenv("MYAPP_UPLOAD_KEY_PASSWORD") ?: "").trim()

`;

const RELEASE_SIGNING_BLOCK = `
        release {
            if (releaseStoreFile) {
                storeFile file(releaseStoreFile)
                storePassword releaseStorePassword
                keyAlias releaseKeyAlias
                keyPassword releaseKeyPassword
            }
        }`;

const withReleaseSigning = (config) => {
  config = withGradleProperties(config, (cfg) => {
    const storeFile =
      process.env.MYAPP_UPLOAD_STORE_FILE || '../../release-keystore.jks';
    const keyAlias = process.env.MYAPP_UPLOAD_KEY_ALIAS || 'key0';
    const storePassword =
      process.env.MYAPP_UPLOAD_STORE_PASSWORD || 'result2026';
    const keyPassword =
      process.env.MYAPP_UPLOAD_KEY_PASSWORD || 'result2026';

    setProperty(cfg.modResults, 'MYAPP_UPLOAD_STORE_FILE', storeFile);
    setProperty(cfg.modResults, 'MYAPP_UPLOAD_KEY_ALIAS', keyAlias);
    setProperty(cfg.modResults, 'MYAPP_UPLOAD_STORE_PASSWORD', storePassword);
    setProperty(cfg.modResults, 'MYAPP_UPLOAD_KEY_PASSWORD', keyPassword);

    return cfg;
  });

  config = withAppBuildGradle(config, (cfg) => {
    let contents = cfg.modResults.contents;

    if (!contents.includes('MYAPP_UPLOAD_STORE_FILE')) {
      contents = contents.replace(
        /(android\s*\{)/,
        `${RELEASE_PROPS_BLOCK}$1`,
      );
    }

    contents = contents.replace(
      /(signingConfigs\s*\{\s*debug\s*\{[^}]*\})(\s*\})/,
      (_match, head, tail) => {
        if (/release\s*\{/.test(head)) return _match;
        return `${head}${RELEASE_SIGNING_BLOCK}${tail}`;
      },
    );

    contents = contents.replace(
      /(\/\/ Caution! In production[\s\S]*?)signingConfig\s+signingConfigs\.debug/,
      `$1signingConfig releaseStoreFile ? signingConfigs.release : signingConfigs.debug`,
    );

    cfg.modResults.contents = contents;
    return cfg;
  });

  return config;
};

module.exports = withReleaseSigning;

const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");

const FLAG = "$RNFirebaseAsStaticFramework = true";

const withFirebaseStaticPodfile = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, "Podfile");
      const contents = fs.readFileSync(podfilePath, "utf-8");
      if (contents.includes(FLAG)) return cfg;
      fs.writeFileSync(podfilePath, `${FLAG}\n${contents}`);
      return cfg;
    },
  ]);
};

module.exports = withFirebaseStaticPodfile;

const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins');

function withAndroidSingleTask(config) {
  return withAndroidManifest(config, (manifestConfig) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(manifestConfig.modResults);

    mainActivity.$['android:launchMode'] = 'singleTask';

    return manifestConfig;
  });
}

module.exports = withAndroidSingleTask;

const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins');

function withAndroidSingleTask(config) {
  return withAndroidManifest(config, (manifestConfig) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      manifestConfig.modResults
    );
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(manifestConfig.modResults);
    const isProductionBuild = process.env.EAS_BUILD_PROFILE === 'production';
    const usesHttpApi = process.env.EXPO_PUBLIC_API_BASE_URL?.startsWith('http://');

    mainActivity.$['android:launchMode'] = 'singleTask';

    if (!isProductionBuild && usesHttpApi) {
      mainApplication.$['android:usesCleartextTraffic'] = 'true';
    }

    return manifestConfig;
  });
}

module.exports = withAndroidSingleTask;

if (rawAssets.length === 0 && stationId) {
  rawAssets = Object.keys(assetsMetadata).filter(
    code => assetsMetadata[code]?.station === stationId
  );
}

/**
 * Generates a unique TrackFlow tracking ID.
 * Format: TF-{ORIGIN}-{DEST}-{8 random digits}
 * Example: TF-DE-US-29183746
 */
function generateTrackingId(originCountry, destinationCountry) {
  const origin = (originCountry || 'XX').toUpperCase().slice(0, 2);
  const dest = (destinationCountry || 'XX').toUpperCase().slice(0, 2);
  const num = Math.floor(10000000 + Math.random() * 90000000);
  return `TF-${origin}-${dest}-${num}`;
}

module.exports = { generateTrackingId };

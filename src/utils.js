/**
 * Classifies a day's forecast accuracy by comparing predicted to actual
 * rainfall.
 *
 * @param {number} predicted - Predicted rainfall in mm.
 * @param {number} actual - Actual rainfall in mm.
 * @return {string} One of "Accurate", "Overpredicted", or "Underpredicted".
 */
export function classifyAccuracy(predicted, actual) {
  const diff = predicted - actual;
  if (Math.abs(diff) <= 2) return "Accurate";
  if (diff > 2) return "Overpredicted";
  return "Underpredicted";
}

/**
 * Rounds a number to one decimal place, for cleaner on-screen display.
 *
 * @param {number} value - The number to round.
 * @return {number} The value rounded to one decimal place.
 */
export function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}
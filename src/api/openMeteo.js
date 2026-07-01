// Historical Weather Archive API docs: https://open-meteo.com/en/docs/historical-weather-api
/**
 * Fetches actual (observed) daily rainfall totals for a location and date
 * range from the Open-Meteo Historical Weather (Archive) API.
 *
 * API docs: https://open-meteo.com/en/docs/historical-weather-api
 *
 * @param {number} latitude - Latitude of the location, in decimal degrees.
 * @param {number} longitude - Longitude of the location, in decimal degrees.
 * @param {string} startDate - Start of the date range, formatted as
 *     "YYYY-MM-DD".
 * @param {string} endDate - End of the date range, formatted as
 *     "YYYY-MM-DD".
 * @return {Promise<Object>} The API's "daily" object, containing parallel
 *     arrays `time` (date strings) and `precipitation_sum` (mm of rain per
 *     day, indexed to match `time`).
 */
export async function fetchActualRainfall(latitude, longitude, startDate, endDate) {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=precipitation_sum&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    return data.daily
}

/**
 * Converts the Archive API's parallel-array "daily" object into an array of
 * row objects, one per day, suitable for rendering in a list.
 *
 * @param {Object} daily - The "daily" object returned by
 *     `fetchActualRainfall`, containing `time` and `precipitation_sum`
 *     arrays of equal length.
 * @return {Array<{date: string, actual: number}>} One object per day, with
 *     `date` (e.g. "2026-06-01") and `actual` (rainfall in mm).
 */
export function shapeRainfallData(daily) {
    return daily.time.map((date, i) => {
        return {
            date: date,
            actual: daily.precipitation_sum[i],
        }
    })
}

/**
 * Fetches predicted rainfall for a location, frozen at a fixed forecast
 * lead time, from the Open-Meteo Previous Runs API. Returns hourly data —
 * there is no daily-sum version of this dataset.
 *
 * API docs: https://open-meteo.com/en/docs/previous-runs-api
 *
 * @param {number} latitude - Latitude of the location, in decimal degrees.
 * @param {number} longitude - Longitude of the location, in decimal degrees.
 * @param {number} leadDays - How many days before the valid date the
 *     forecast was issued (e.g. 3 = "what the model predicted 3 days out").
 * @return {Promise<Object>} The API's "hourly" object, containing parallel
 *     arrays `time` (timestamps) and `precipitation_previous_dayN` (mm of
 *     rain per hour, indexed to match `time`).
 */
export async function fetchPredictedRainfall(latitude, longitude, leadDays) {
  const variable = `precipitation_previous_day${leadDays}`;
  const url = `https://previous-runs-api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=${variable}&past_days=30&forecast_days=1&timezone=auto`;

  const response = await fetch(url);
  const data = await response.json();

  return data.hourly;
}

/**
 * Sums hourly predicted rainfall into daily totals. Any day with a missing
 * hour (e.g. beyond a regional model's forecast horizon at longer lead
 * times) is left out entirely, rather than reporting a partial total.
 *
 * @param {Object} hourly - The "hourly" object returned by
 *     `fetchPredictedRainfall`, containing a `time` array and a
 *     `precipitation_previous_dayN` array of equal length.
 * @param {number} leadDays - The same lead time passed to
 *     `fetchPredictedRainfall`, used to read the correct field name back
 *     out of `hourly`.
 * @return {Object} A plain object mapping each date string (e.g.
 *     "2026-06-01") to its total predicted rainfall in mm.
 */

export function aggregateHourlyToDaily(hourly, leadDays) {
  const variable = `precipitation_previous_day${leadDays}`;
  const hourlyValues = hourly[variable];

  const dailyTotals = {};
  const incompleteDays = new Set();

  hourly.time.forEach((timestamp, i) => {
    const date = timestamp.slice(0, 10);
    const value = hourlyValues[i];

    if (value === null || value === undefined) {
      incompleteDays.add(date);
      return;
    }

    if (dailyTotals[date] === undefined) {
      dailyTotals[date] = 0;
    }
    dailyTotals[date] += value;
  });

  incompleteDays.forEach((date) => {
    delete dailyTotals[date];
  });

  return dailyTotals;
}

/**
 * Merges actual rainfall rows with predicted daily totals into a single
 * array of combined rows, one per day. Only dates present in both datasets
 * are kept, since a day without both an actual and a predicted value can't
 * be compared.
 *
 * @param {Array<{date: string, actual: number}>} actualRows - Rows from
 *     `shapeRainfallData`.
 * @param {Object} predictedTotals - Date-to-total-rainfall map from
 *     `aggregateHourlyToDaily`.
 * @return {Array<{date: string, actual: number, predicted: number}>}
 *     Combined rows, one per day that has both values.
 */
export function mergeRainfallData(actualRows, predictedTotals) {
  const merged = actualRows.map((row) => {
    return {
      date: row.date,
      actual: row.actual,
      predicted: predictedTotals[row.date],
    };
  });

  return merged.filter((row) => row.predicted !== undefined);
}

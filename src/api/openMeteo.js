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
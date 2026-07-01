// Historical Weather Archive API docs: https://open-meteo.com/en/docs/historical-weather-api
export async function fetchActualRainfall(latitude, longitude, startDate, endDate) {
    const url = `https://archive.api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=precipitation_sum&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    return data.daily
}
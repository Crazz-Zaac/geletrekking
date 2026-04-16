import { useEffect, useState } from 'react'

type WeatherData = {
  condition: string
  temp: string
  humidity: string
  wind: string
}

type WeatherState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'ready'; data: WeatherData }

// maps the weather code from Open-Meteo into a human readable condition string
function interpretWeatherCode(code: number): string {
  if (code === 0) return 'Clear sky'
  if (code === 1) return 'Mainly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code <= 49) return 'Foggy'
  if (code <= 59) return 'Drizzle'
  if (code <= 69) return 'Rainy'
  if (code <= 79) return 'Snow'
  if (code <= 84) return 'Rain showers'
  if (code <= 94) return 'Thunderstorm'
  return 'Variable'
}

export function useTrekWeather(
  latitude?: number,
  longitude?: number
): WeatherState {
  const [state, setState] = useState<WeatherState>({ status: 'loading' })

  useEffect(() => {
    // if no coordinates are set for this trek, show unavailable straight away
    if (!latitude || !longitude) {
      setState({ status: 'unavailable' })
      return
    }

    let cancelled = false

    const fetchWeather = async () => {
      setState({ status: 'loading' })
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${latitude}` +
          `&longitude=${longitude}` +
          `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
          `&wind_speed_unit=kmh` +
          `&forecast_days=1`

        const response = await fetch(url)
        if (!response.ok) throw new Error('Weather fetch failed')

        const json = await response.json()
        const current = json.current

        if (cancelled) return

        setState({
          status: 'ready',
          data: {
            condition: interpretWeatherCode(current.weather_code),
            temp: `${Math.round(current.temperature_2m)}°C`,
            humidity: `${current.relative_humidity_2m}%`,
            wind: `${Math.round(current.wind_speed_10m)} km/h`,
          },
        })
      } catch {
        if (!cancelled) {
          setState({ status: 'unavailable' })
        }
      }
    }

    void fetchWeather()

    return () => {
      cancelled = true
    }
  }, [latitude, longitude])

  return state
}
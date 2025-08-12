import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { WeatherConfig } from '../../lib/utilityTypes';

interface WeatherWidgetProps {
  config: WeatherConfig;
  size: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

interface WeatherData {
  current?: {
    temperature_2m: number;
    weather_code: number;
    time: string;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
  };
}

interface PlaceWeather {
  place: string;
  data: WeatherData;
  loading: boolean;
  error?: string;
}

export default function WeatherWidget({ config, size, className = '' }: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<PlaceWeather[]>([]);
  const { places, mode, units, showIcon, refreshSec } = config;
  
  console.log('WeatherWidget received config:', config);
  console.log('WeatherWidget places:', places);
  
  // Weather code to icon mapping
  const getWeatherIcon = (code: number) => {
    if (code === 0) return '☀️'; // Clear sky
    if (code >= 1 && code <= 3) return '🌤️'; // Partly cloudy
    if (code >= 45 && code <= 48) return '🌫️'; // Foggy
    if (code >= 51 && code <= 55) return '🌧️'; // Drizzle
    if (code >= 56 && code <= 57) return '🌨️'; // Freezing drizzle
    if (code >= 61 && code <= 65) return '🌧️'; // Rain
    if (code >= 66 && code <= 67) return '🌨️'; // Freezing rain
    if (code >= 71 && code <= 75) return '🌨️'; // Snow
    if (code >= 77 && code <= 77) return '🌨️'; // Snow grains
    if (code >= 80 && code <= 82) return '🌧️'; // Rain showers
    if (code >= 85 && code <= 86) return '🌨️'; // Snow showers
    if (code >= 95 && code <= 95) return '⛈️'; // Thunderstorm
    if (code >= 96 && code <= 99) return '⛈️'; // Thunderstorm with hail
    return '🌤️'; // Default
  };
  
  // Fetch weather data from Open-Meteo
  const fetchWeather = async (lat: number, lon: number, place: string) => {
    try {
      let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=auto`;
      
      switch (mode) {
        case 'current':
          url += '&current=temperature_2m,weather_code';
          break;
        case 'daily3':
          url += '&daily=temperature_2m_max,temperature_2m_min,weather_code';
          break;
        case 'hourly24':
          url += '&hourly=temperature_2m,precipitation';
          break;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Weather API response for', place, ':', data);
      console.log('API URL used:', url);
      
      // Check if we have any data at all
      if (!data || Object.keys(data).length === 0) {
        console.error('Empty response from API');
        return { place, data: {}, loading: false, error: 'Empty API response' };
      }
      
      return { place, data, loading: false };
    } catch (error) {
      console.error('Weather fetch error:', error);
      return { place, data: {}, loading: false, error: 'Failed to fetch weather' };
    }
  };
  
  // Fetch weather for all places
  useEffect(() => {
    const fetchAllWeather = async () => {
      setWeatherData(places.map(p => ({ place: p.label, data: {}, loading: true })));
      
      const results = await Promise.all(
        places.map(p => fetchWeather(p.lat, p.lon, p.label))
      );
      
      setWeatherData(results);
    };
    
    fetchAllWeather();
    
    // Refresh every refreshSec
    const interval = setInterval(fetchAllWeather, refreshSec * 1000);
    return () => clearInterval(interval);
  }, [places, mode, refreshSec]);
  
  // Get size-specific styling
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-4',
          title: 'text-lg font-semibold',
          temp: 'text-3xl font-bold',
          place: 'text-sm',
          grid: 'grid-cols-1 gap-3'
        };
      case 'md':
        return {
          container: 'p-5',
          title: 'text-xl font-semibold',
          temp: 'text-4xl font-bold',
          place: 'text-base',
          grid: 'grid-cols-2 gap-4'
        };
      case 'lg':
        return {
          container: 'p-6',
          title: 'text-2xl font-semibold',
          temp: 'text-5xl font-bold',
          place: 'text-lg',
          grid: 'grid-cols-3 gap-5'
        };
      case 'xl':
        return {
          container: 'p-8',
          title: 'text-3xl font-semibold',
          temp: 'text-6xl font-bold',
          place: 'text-xl',
          grid: 'grid-cols-2 gap-6'
        };
    }
  };
  
  const styles = getSizeStyles();
  
  // Format temperature
  const formatTemp = (temp: number) => {
    const rounded = Math.round(temp);
    return `${rounded}°${units === 'metric' ? 'C' : 'F'}`;
  };
  
  // Render current weather
  const renderCurrentWeather = (weather: PlaceWeather) => {
    if (weather.loading) {
      return <div className="text-neutral-400">Loading...</div>;
    }
    
    if (weather.error) {
      console.log('Weather error for', weather.place, ':', weather.error, 'data:', weather.data);
      return <div className="text-red-400">Error: {weather.error}</div>;
    }
    
    // Try different possible data structures
    let temperature = null;
    let weatherCode = 0;
    
    if (weather.data.current) {
      temperature = weather.data.current.temperature_2m;
      weatherCode = weather.data.current.weather_code;
    } else if (weather.data.current_weather) {
      temperature = weather.data.current_weather.temperature;
      weatherCode = weather.data.current_weather.weathercode;
    } else if (weather.data.hourly && weather.data.hourly.temperature_2m && weather.data.hourly.temperature_2m.length > 0) {
      // Fallback to first hourly data point
      temperature = weather.data.hourly.temperature_2m[0];
      weatherCode = weather.data.hourly.weathercode ? weather.data.hourly.weathercode[0] : 0;
    }
    
    if (temperature === null) {
      console.log('No temperature data found for', weather.place, 'data:', weather.data);
      console.log('Available keys in data:', Object.keys(weather.data));
      if (weather.data.current) console.log('Current data:', weather.data.current);
      if (weather.data.current_weather) console.log('Current weather data:', weather.data.current_weather);
      if (weather.data.hourly) console.log('Hourly data keys:', Object.keys(weather.data.hourly));
      return <div className="text-red-400">Error: No temperature data</div>;
    }
    
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <div className={`${styles.place} font-medium text-neutral-600`}>
          {weather.place}
        </div>
        
        {showIcon && (
          <div className="text-2xl">
            {getWeatherIcon(weatherCode)}
          </div>
        )}
        
        <div className={`${styles.temp} text-neutral-900`}>
          {formatTemp(temperature)}
        </div>
      </div>
    );
  };
  
  // Render daily forecast
  const renderDailyForecast = (weather: PlaceWeather) => {
    if (weather.loading) {
      return <div className="text-neutral-400">Loading...</div>;
    }
    
    if (weather.error || !weather.data.daily) {
      return <div className="text-red-400">Error</div>;
    }
    
    const { time, temperature_2m_max, temperature_2m_min, weather_code } = weather.data.daily;
    
    return (
      <div className="space-y-3">
        <div className={`${styles.place} font-medium text-neutral-600 text-center`}>
          {weather.place}
        </div>
        
        <div className="space-y-2">
          {time.slice(0, 3).map((date, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="text-sm text-neutral-500">
                {new Date(date).toLocaleDateString('en-GB', { weekday: 'short' })}
              </div>
              <div className="flex items-center space-x-2">
                {showIcon && (
                  <span className="text-lg">
                    {getWeatherIcon(weather_code[index])}
                  </span>
                )}
                <div className="text-sm font-medium">
                  {formatTemp(temperature_2m_max[index])} / {formatTemp(temperature_2m_min[index])}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render hourly forecast
  const renderHourlyForecast = (weather: PlaceWeather) => {
    if (weather.loading) {
      return <div className="text-neutral-400">Loading...</div>;
    }
    
    if (weather.error || !weather.data.hourly) {
      return <div className="text-red-400">Error</div>;
    }
    
    const { time, temperature_2m } = weather.data.hourly;
    
    return (
      <div className="space-y-3">
        <div className={`${styles.place} font-medium text-neutral-600 text-center`}>
          {weather.place}
        </div>
        
        <div className="grid grid-cols-6 gap-1">
          {time.slice(0, 24).map((hour, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-neutral-500">
                {new Date(hour).toLocaleTimeString('en-GB', { hour: '2-digit', hour12: false })}
              </div>
              <div className="text-sm font-medium">
                {formatTemp(temperature_2m[index])}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <Card className={`bg-white border border-neutral-200 rounded-2xl shadow-sm h-full flex flex-col ${className}`}>
      <CardHeader className={`${styles.container} pb-3`}>
        <CardTitle className={`${styles.title} text-neutral-800 flex items-center justify-between`}>
          <span>Weather</span>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            AI created
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className={`${styles.container} pt-0 flex-1`}>
        <div className={`${styles.grid} h-full`}>
          {weatherData.map((weather, index) => (
            <div key={index} className="flex flex-col">
              {mode === 'current' && renderCurrentWeather(weather)}
              {mode === 'daily3' && renderDailyForecast(weather)}
              {mode === 'hourly24' && renderHourlyForecast(weather)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
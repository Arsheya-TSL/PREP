// Utility Widget Types for Clock and Weather

export type WorldClockConfig = {
  cities: Array<{ label: string; tz: string }>;
  format: 'HH:mm' | 'hh:mm A' | 'HH:mm:ss' | 'hh:mm:ss A';
  showDate: boolean;
  showBadges: boolean; // day/night
  tickMs: number; // default 1000
};

export type WeatherConfig = {
  places: Array<{ label: string; lat: number; lon: number }>;
  mode: 'current' | 'daily3' | 'hourly24';
  units: 'metric' | 'imperial';
  showIcon: boolean;
  refreshSec: number; // default 900
};

export type UtilityWidgetDef = {
  kind: 'utility';
  utilityType: 'world-clock' | 'weather';
  name: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  options?: Record<string, any>;
  config: WorldClockConfig | WeatherConfig;
};

// City data for common cities
export interface CityData {
  name: string;
  tz: string;
  lat: number;
  lon: number;
  country: string;
}

// Fuzzy matching dictionaries
export const WIDGET_HINTS = {
  clock: ['time', 'clock', 'timezone', 'zone', 'world clock', 'local time', 'city time'],
  weather: ['weather', 'temperature', 'temp', 'forecast', 'rain', 'sunny', 'wind', 'humidity']
};

export const TIME_FORMAT_HINTS = {
  '24h': ['24', '24h', 'military'],
  '12h': ['12', '12h', 'am', 'pm']
};

export const PERIOD_HINTS = {
  current: ['now', 'today', 'right now', 'live'],
  daily3: ['3 day', 'next 3', '4 day', 'next 4', 'few days', 'weekend', 'coming days'],
  hourly24: ['24h', '24 hours', 'today hourly', 'hourly']
}; 
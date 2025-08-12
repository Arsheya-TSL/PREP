import { CityData } from './utilityTypes';

// Common cities with timezone and coordinates
export const CITY_INDEX: Record<string, CityData> = {
  // UK Cities
  'london': { name: 'London', tz: 'Europe/London', lat: 51.5074, lon: -0.1278, country: 'UK' },
  'manchester': { name: 'Manchester', tz: 'Europe/London', lat: 53.4808, lon: -2.2426, country: 'UK' },
  'birmingham': { name: 'Birmingham', tz: 'Europe/London', lat: 52.4862, lon: -1.8904, country: 'UK' },
  'edinburgh': { name: 'Edinburgh', tz: 'Europe/London', lat: 55.9533, lon: -3.1883, country: 'UK' },
  'glasgow': { name: 'Glasgow', tz: 'Europe/London', lat: 55.8642, lon: -4.2518, country: 'UK' },
  
  // US Cities
  'new york': { name: 'New York', tz: 'America/New_York', lat: 40.7128, lon: -74.0060, country: 'US' },
  'nyc': { name: 'New York', tz: 'America/New_York', lat: 40.7128, lon: -74.0060, country: 'US' },
  'los angeles': { name: 'Los Angeles', tz: 'America/Los_Angeles', lat: 34.0522, lon: -118.2437, country: 'US' },
  'chicago': { name: 'Chicago', tz: 'America/Chicago', lat: 41.8781, lon: -87.6298, country: 'US' },
  'miami': { name: 'Miami', tz: 'America/New_York', lat: 25.7617, lon: -80.1918, country: 'US' },
  'san francisco': { name: 'San Francisco', tz: 'America/Los_Angeles', lat: 37.7749, lon: -122.4194, country: 'US' },
  
  // European Cities
  'paris': { name: 'Paris', tz: 'Europe/Paris', lat: 48.8566, lon: 2.3522, country: 'France' },
  'berlin': { name: 'Berlin', tz: 'Europe/Berlin', lat: 52.5200, lon: 13.4050, country: 'Germany' },
  'madrid': { name: 'Madrid', tz: 'Europe/Madrid', lat: 40.4168, lon: -3.7038, country: 'Spain' },
  'rome': { name: 'Rome', tz: 'Europe/Rome', lat: 41.9028, lon: 12.4964, country: 'Italy' },
  'amsterdam': { name: 'Amsterdam', tz: 'Europe/Amsterdam', lat: 52.3676, lon: 4.9041, country: 'Netherlands' },
  'stockholm': { name: 'Stockholm', tz: 'Europe/Stockholm', lat: 59.3293, lon: 18.0686, country: 'Sweden' },
  'oslo': { name: 'Oslo', tz: 'Europe/Oslo', lat: 59.9139, lon: 10.7522, country: 'Norway' },
  'copenhagen': { name: 'Copenhagen', tz: 'Europe/Copenhagen', lat: 55.6761, lon: 12.5683, country: 'Denmark' },
  'helsinki': { name: 'Helsinki', tz: 'Europe/Helsinki', lat: 60.1699, lon: 24.9384, country: 'Finland' },
  'prague': { name: 'Prague', tz: 'Europe/Prague', lat: 50.0755, lon: 14.4378, country: 'Czech Republic' },
  'vienna': { name: 'Vienna', tz: 'Europe/Vienna', lat: 48.2082, lon: 16.3738, country: 'Austria' },
  'zurich': { name: 'Zurich', tz: 'Europe/Zurich', lat: 47.3769, lon: 8.5417, country: 'Switzerland' },
  'dublin': { name: 'Dublin', tz: 'Europe/Dublin', lat: 53.3498, lon: -6.2603, country: 'Ireland' },
  
  // Asian Cities
  'tokyo': { name: 'Tokyo', tz: 'Asia/Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan' },
  'sydney': { name: 'Sydney', tz: 'Australia/Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia' },
  'melbourne': { name: 'Melbourne', tz: 'Australia/Melbourne', lat: -37.8136, lon: 144.9631, country: 'Australia' },
  'singapore': { name: 'Singapore', tz: 'Asia/Singapore', lat: 1.3521, lon: 103.8198, country: 'Singapore' },
  'hong kong': { name: 'Hong Kong', tz: 'Asia/Hong_Kong', lat: 22.3193, lon: 114.1694, country: 'Hong Kong' },
  'seoul': { name: 'Seoul', tz: 'Asia/Seoul', lat: 37.5665, lon: 126.9780, country: 'South Korea' },
  'beijing': { name: 'Beijing', tz: 'Asia/Shanghai', lat: 39.9042, lon: 116.4074, country: 'China' },
  'shanghai': { name: 'Shanghai', tz: 'Asia/Shanghai', lat: 31.2304, lon: 121.4737, country: 'China' },
  'mumbai': { name: 'Mumbai', tz: 'Asia/Kolkata', lat: 19.0760, lon: 72.8777, country: 'India' },
  'delhi': { name: 'Delhi', tz: 'Asia/Kolkata', lat: 28.7041, lon: 77.1025, country: 'India' },
  'bangkok': { name: 'Bangkok', tz: 'Asia/Bangkok', lat: 13.7563, lon: 100.5018, country: 'Thailand' },
  'jakarta': { name: 'Jakarta', tz: 'Asia/Jakarta', lat: -6.2088, lon: 106.8456, country: 'Indonesia' },
  'manila': { name: 'Manila', tz: 'Asia/Manila', lat: 14.5995, lon: 120.9842, country: 'Philippines' },
  
  // Middle East
  'dubai': { name: 'Dubai', tz: 'Asia/Dubai', lat: 25.2048, lon: 55.2708, country: 'UAE' },
  'abu dhabi': { name: 'Abu Dhabi', tz: 'Asia/Dubai', lat: 24.4539, lon: 54.3773, country: 'UAE' },
  'doha': { name: 'Doha', tz: 'Asia/Qatar', lat: 25.2854, lon: 51.5310, country: 'Qatar' },
  'riyadh': { name: 'Riyadh', tz: 'Asia/Riyadh', lat: 24.7136, lon: 46.6753, country: 'Saudi Arabia' },
  'tel aviv': { name: 'Tel Aviv', tz: 'Asia/Jerusalem', lat: 32.0853, lon: 34.7818, country: 'Israel' },
  
  // Other Major Cities
  'moscow': { name: 'Moscow', tz: 'Europe/Moscow', lat: 55.7558, lon: 37.6176, country: 'Russia' },
  'istanbul': { name: 'Istanbul', tz: 'Europe/Istanbul', lat: 41.0082, lon: 28.9784, country: 'Turkey' },
  'cairo': { name: 'Cairo', tz: 'Africa/Cairo', lat: 30.0444, lon: 31.2357, country: 'Egypt' },
  'johannesburg': { name: 'Johannesburg', tz: 'Africa/Johannesburg', lat: -26.2041, lon: 28.0473, country: 'South Africa' },
  'mexico city': { name: 'Mexico City', tz: 'America/Mexico_City', lat: 19.4326, lon: -99.1332, country: 'Mexico' },
  'sao paulo': { name: 'São Paulo', tz: 'America/Sao_Paulo', lat: -23.5505, lon: -46.6333, country: 'Brazil' },
  'buenos aires': { name: 'Buenos Aires', tz: 'America/Argentina/Buenos_Aires', lat: -34.6118, lon: -58.3960, country: 'Argentina' },
  'toronto': { name: 'Toronto', tz: 'America/Toronto', lat: 43.6532, lon: -79.3832, country: 'Canada' },
  'vancouver': { name: 'Vancouver', tz: 'America/Vancouver', lat: 49.2827, lon: -123.1207, country: 'Canada' },
  'montreal': { name: 'Montreal', tz: 'America/Montreal', lat: 45.5017, lon: -73.5673, country: 'Canada' }
};

// Common shorthand mappings
export const CITY_SHORTHAND: Record<string, string> = {
  'uk': 'london',
  'usa': 'new york',
  'us': 'new york',
  'america': 'new york',
  'australia': 'sydney',
  'japan': 'tokyo',
  'china': 'beijing',
  'india': 'mumbai',
  'germany': 'berlin',
  'france': 'paris',
  'spain': 'madrid',
  'italy': 'rome',
  'sweden': 'stockholm',
  'norway': 'oslo',
  'denmark': 'copenhagen',
  'finland': 'helsinki',
  'netherlands': 'amsterdam',
  'switzerland': 'zurich',
  'austria': 'vienna',
  'ireland': 'dublin'
};

// Get city data by name (with fuzzy matching)
export function getCityData(cityName: string): CityData | null {
  const normalized = cityName.toLowerCase().trim();
  
  // Check exact match first
  if (CITY_INDEX[normalized]) {
    return CITY_INDEX[normalized];
  }
  
  // Check shorthand
  if (CITY_SHORTHAND[normalized]) {
    return CITY_INDEX[CITY_SHORTHAND[normalized]];
  }
  
  // Fuzzy match (simple contains check for now)
  for (const [key, city] of Object.entries(CITY_INDEX)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return city;
    }
  }
  
  return null;
} 
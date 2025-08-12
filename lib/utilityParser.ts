import { UtilityWidgetDef, WorldClockConfig, WeatherConfig, WIDGET_HINTS, TIME_FORMAT_HINTS, PERIOD_HINTS } from './utilityTypes';
import { getCityData } from './cityIndex';

// Preprocess text: lowercase, trim, normalize punctuation, replace shorthand
function preprocessText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b(pls|plz)\b/g, 'please')
    .replace(/\btmrw\b/g, 'tomorrow')
    .replace(/\buk\b/g, 'united kingdom')
    .replace(/\bnyc\b/g, 'new york')
    .replace(/\busa\b/g, 'united states')
    .replace(/\bus\b/g, 'united states');
}

// Remove filler words
function removeFillerWords(text: string): string {
  const fillers = ['please', 'show', 'me', 'can', 'you', 'add', 'create', 'make', 'get', 'want', 'need'];
  return text
    .split(' ')
    .filter(word => !fillers.includes(word))
    .join(' ');
}

// Fuzzy matching (simple includes for now)
function fuzzyMatch(text: string, hints: string[]): boolean {
  return hints.some(hint => text.includes(hint));
}

// Extract cities from text
function extractCities(text: string): string[] {
  const words = text.split(' ');
  const cities: string[] = [];
  
  console.log('Extracting cities from words:', words);
  
  for (let i = 0; i < words.length; i++) {
    // Check single word
    if (getCityData(words[i])) {
      console.log('Found single word city:', words[i]);
      cities.push(words[i]);
      continue;
    }
    
    // Check two words (e.g., "new york")
    if (i < words.length - 1) {
      const twoWords = `${words[i]} ${words[i + 1]}`;
      if (getCityData(twoWords)) {
        console.log('Found two word city:', twoWords);
        cities.push(twoWords);
        i++; // Skip next word
        continue;
      }
    }
    
    // Check three words (e.g., "san francisco")
    if (i < words.length - 2) {
      const threeWords = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (getCityData(threeWords)) {
        console.log('Found three word city:', threeWords);
        cities.push(threeWords);
        i += 2; // Skip next two words
        continue;
      }
    }
  }
  
  console.log('Final extracted cities:', cities);
  return [...new Set(cities)]; // Remove duplicates
}

// Parse clock intent
function parseClockIntent(text: string): UtilityWidgetDef {
  const cities = extractCities(text);
  const cityData = cities.map(city => getCityData(city)).filter(Boolean);
  
  // Default cities if none found
  const finalCities = cityData.length > 0 ? cityData : [
    getCityData('london')!,
    getCityData('new york')!,
    getCityData('sydney')!
  ];
  
  // Determine format
  let format: 'HH:mm' | 'hh:mm A' | 'HH:mm:ss' = 'HH:mm';
  if (fuzzyMatch(text, TIME_FORMAT_HINTS['12h'])) {
    format = 'hh:mm A';
  }
  if (text.includes('second')) {
    format = format === 'hh:mm A' ? 'hh:mm:ss A' : 'HH:mm:ss';
  }
  
  // Determine size based on number of cities
  let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  if (finalCities.length <= 3) size = 'md';
  else if (finalCities.length <= 8) size = 'lg';
  else size = 'xl';
  
  const config: WorldClockConfig = {
    cities: finalCities.map(city => ({ label: city!.name, tz: city!.tz })),
    format,
    showDate: size === 'lg' || size === 'xl',
    showBadges: size === 'lg' || size === 'xl',
    tickMs: 1000
  };
  
  return {
    kind: 'utility',
    utilityType: 'world-clock',
    name: `World Clock - ${finalCities.map(c => c!.name).join(', ')}`,
    size,
    config
  };
}

// Parse weather intent
function parseWeatherIntent(text: string): UtilityWidgetDef {
  const cities = extractCities(text);
  const cityData = cities.map(city => getCityData(city)).filter(Boolean);
  
  console.log('Weather parsing - extracted cities:', cities);
  console.log('Weather parsing - city data:', cityData);
  
  // Determine mode
  let mode: 'current' | 'daily3' | 'hourly24' = 'current';
  if (fuzzyMatch(text, PERIOD_HINTS.daily3)) {
    mode = 'daily3';
  } else if (fuzzyMatch(text, PERIOD_HINTS.hourly24)) {
    mode = 'hourly24';
  }
  
  console.log('Weather parsing - mode:', mode);
  
  // Determine units
  const units: 'metric' | 'imperial' = text.includes('fahrenheit') || text.includes('us') ? 'imperial' : 'metric';
  
  // Determine size
  let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  if (cityData.length === 1) {
    size = mode === 'current' ? 'sm' : 'md';
  } else if (cityData.length <= 3) {
    size = mode === 'current' ? 'md' : 'lg';
  } else {
    size = 'xl';
  }
  
  const config: WeatherConfig = {
    places: cityData.map(city => ({ label: city!.name, lat: city!.lat, lon: city!.lon })),
    mode,
    units,
    showIcon: true,
    refreshSec: 900
  };
  
  console.log('Weather parsing - final config:', config);
  
  return {
    kind: 'utility',
    utilityType: 'weather',
    name: `Weather - ${cityData.map(c => c!.name).join(', ')}`,
    size,
    options: { units },
    config
  };
}

// Main parser function
export function parseUtilityIntent(text: string): { success: boolean; definition?: UtilityWidgetDef; clarification?: string } {
  const processed = removeFillerWords(preprocessText(text));
  
  console.log('Parsing utility intent:', { original: text, processed });
  
  // Extract cities first to see if this is likely a utility widget
  const cities = extractCities(processed);
  console.log('Extracted cities:', cities);
  
  // Detect widget type
  const isClock = fuzzyMatch(processed, WIDGET_HINTS.clock);
  const isWeather = fuzzyMatch(processed, WIDGET_HINTS.weather);
  
  console.log('Widget detection:', { isClock, isWeather });
  
  // Only proceed with utility parsing if we have cities OR strong utility keywords
  const hasStrongClockSignal = isClock && (cities.length > 0 || processed.includes('clock') || processed.includes('timezone'));
  const hasStrongWeatherSignal = isWeather && (cities.length > 0 || processed.includes('weather') || processed.includes('temperature') || processed.includes('forecast'));
  
  console.log('Strong signals:', { hasStrongClockSignal, hasStrongWeatherSignal });
  
  // If both detected, ask for clarification
  if (hasStrongClockSignal && hasStrongWeatherSignal) {
    return { success: false, clarification: 'Do you want a clock or weather widget?' };
  }
  
  // Parse based on type
  if (hasStrongClockSignal) {
    console.log('Parsing clock intent');
    return { success: true, definition: parseClockIntent(processed) };
  }
  
  if (hasStrongWeatherSignal) {
    console.log('Parsing weather intent');
    if (cities.length === 0) {
      return { success: false, clarification: 'Which city or country?' };
    }
    const definition = parseWeatherIntent(processed);
    console.log('Weather definition:', definition);
    return { success: true, definition };
  }
  
  // If no strong utility signals detected, return false to fall back to data widget parser
  console.log('No strong utility signals detected, falling back to data widget parser');
  return { success: false };
}

// Handle clarification response
export function handleClarification(originalText: string, clarification: string, response: string): UtilityWidgetDef | null {
  const processed = removeFillerWords(preprocessText(originalText));
  
  if (clarification === 'Do you want a clock or weather widget?') {
    const responseLower = response.toLowerCase();
    if (responseLower.includes('clock') || responseLower.includes('time')) {
      return parseClockIntent(processed);
    } else if (responseLower.includes('weather') || responseLower.includes('temp')) {
      const cities = extractCities(processed);
      if (cities.length === 0) {
        // Add the response as a city
        const cityData = getCityData(response);
        if (cityData) {
          return parseWeatherIntent(processed + ' ' + response);
        }
      }
      return parseWeatherIntent(processed);
    }
  }
  
  if (clarification === 'Which city or country?') {
    const cityData = getCityData(response);
    if (cityData) {
      return parseWeatherIntent(processed + ' ' + response);
    }
  }
  
  return null;
} 
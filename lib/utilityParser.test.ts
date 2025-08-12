import { parseUtilityIntent } from './utilityParser';

// Test the acceptance criteria from the SUPER PROMPT
console.log('🧪 Testing Utility Parser Acceptance Criteria...\n');

// Test 1: "time london sydney sweden" → Clock with London, Sydney, Stockholm; 24h default; lg
console.log('Test 1: "time london sydney sweden"');
const test1 = parseUtilityIntent('time london sydney sweden');
console.log('Result:', test1.success ? '✅ Success' : '❌ Failed');
if (test1.success && test1.definition) {
  console.log('Widget Type:', test1.definition.utilityType);
  console.log('Size:', test1.definition.size);
  console.log('Cities:', test1.definition.config.cities?.map(c => c.label) || 'N/A');
}
console.log('');

// Test 2: "weather in dubai & london next 3 days" → Weather, daily3, two places, lg
console.log('Test 2: "weather in dubai & london next 3 days"');
const test2 = parseUtilityIntent('weather in dubai & london next 3 days');
console.log('Result:', test2.success ? '✅ Success' : '❌ Failed');
if (test2.success && test2.definition) {
  console.log('Widget Type:', test2.definition.utilityType);
  console.log('Mode:', test2.definition.config.mode);
  console.log('Places:', test2.definition.config.places?.map(p => p.label) || 'N/A');
}
console.log('');

// Test 3: "add a clock seconds new york tokyo" → 12h with seconds; md size
console.log('Test 3: "add a clock seconds new york tokyo"');
const test3 = parseUtilityIntent('add a clock seconds new york tokyo');
console.log('Result:', test3.success ? '✅ Success' : '❌ Failed');
if (test3.success && test3.definition) {
  console.log('Widget Type:', test3.definition.utilityType);
  console.log('Format:', test3.definition.config.format);
  console.log('Size:', test3.definition.size);
}
console.log('');

// Test 4: "show temps this week" → should ask for city
console.log('Test 4: "show temps this week"');
const test4 = parseUtilityIntent('show temps this week');
console.log('Result:', test4.success ? '✅ Success' : '❌ Failed');
console.log('Clarification:', test4.clarification || 'None');
console.log('');

// Test 5: Misspellings like "wether", "stokholm", "sidny" still work
console.log('Test 5: "wether in stokholm and sidny"');
const test5 = parseUtilityIntent('wether in stokholm and sidny');
console.log('Result:', test5.success ? '✅ Success' : '❌ Failed');
if (test5.success && test5.definition) {
  console.log('Widget Type:', test5.definition.utilityType);
  console.log('Places:', test5.definition.config.places?.map(p => p.label) || 'N/A');
}
console.log('');

console.log('🎉 Testing complete!'); 
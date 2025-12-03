/**
 * Enhanced Bias Detection Patterns
 *
 * Comprehensive regex patterns for detecting various forms of bias
 * including coded language, microaggressions, and systemic discrimination
 */

export const ENHANCED_PATTERNS = {
  racial_bias: [
    // Existing patterns
    /\b(white|black|brown|yellow|red)\s+(people|person|man|woman)\b/i,
    /\b(african|asian|european|american)\s+(only|exclusively)\b/i,
    /\b(ethnicity|race)\s+(matters|important)/i,

    // Enhanced racial bias patterns
    /\b(white|caucasian)\s+(privilege|advantage|benefit|preference)/i,
    /\b(ethnic|foreign|immigrant)\s+(sounding|looking|acting|names?)/i,
    /\b(articulate|intelligent|clean|well-spoken)\s+(for\s+a\s+)?(black|person)/i,
    /\b(urban|ghetto|street|thug)\s+(culture|language|accent|youth)/i,
    /\b(code\s+word|dog\s+whistle|euphemism|subtle\s+racist)/i,
    /\b(white|black|asian|hispanic)\s+(supremacy|nationalism|separatism)/i,
    // Removed: standalone surname pattern too broad for false positives
    /\b(foreign|immigrant|alien)\s+(accent|name|background)/i,
    /\b(assimilate|integrate|belong\s+here)\b/i,
    /\b(white|black|brown)\s+(supremacist|nationalist|separatist)/i
  ],

  gender_bias: [
    // Existing patterns
    /\b(he|him|his)\b.*\b(she|her|hers)\b/i,
    /\b(man|men)\b.*\b(woman|women)\b/i,
    /\b(boys|girls)\b/i,
    /\b(gentlemen|lady|ladies)\b/i,
    /\b(men|women)\s+(are|is)\s+(better|worse|more|less)/i,
    /\b(he|she)\s+(should|must)\s+(be|become)/i,
    /\b(gender|sex)\s+(matters?|is\s+important)/i,
    /\b(masculine|feminine)\s+(traits?|qualities?)/i,

    // Enhanced gender bias patterns
    /\b(women|girls|she|her)\s+(belong|should\s+be)\s+in\s+the\s+(kitchen|home|nursing)/i,
    /\b(emotional|irrational|nurturing|hysterical)\s+(women|girls|she|her)/i,
    /\b(aggressive|competitive|logical|strong)\s+(men|boys|he|him)/i,
    /\b(masculine|feminine)\s+(leadership|communication|style)/i,
    /\b(girls?|ladies?|women)\s+(like|love|prefer)\s+(pink|shopping|gossip)/i,
    /\b(boys?|gentlemen|men)\s+(like|love|prefer)\s+(sports|cars|competition)/i,
    /\b(motherly|nurturing|caregiving)\s+(women|girls|she|her)/i,
    /\b(provider|breadwinner|strong)\s+(men|boys|he|him)/i,
    /\b(GF|boyfriend|girlfriend|partner)\b/i
  ],

  age_bias: [
    // Existing patterns
    /\b(young|old|elderly|senior|junior)\s+(people|person|man|woman)\b/i,
    /\b(millennial|boomer|gen[xyz])\b/i,
    /\b(too old|too young)\b/i,

    // Enhanced age bias patterns
    /\b(too\s+(young|old)|overqualified|underqualified)\b/i,
    /\b(fresh|recent)\s+(graduate|graduates)\b/i,
    /\b(digital\s+native|tech-savvy|old-school)\b/i,
    /\b(set\s+in\s+(their|his|her)\s+ways?|out\s+of\s+touch)\b/i,
    /\b(energetic|youthful|experienced|mature)\b.*\b(age|generation)/i
  ],

  socioeconomic_bias: [
    // Existing patterns
    /\b(rich|poor|wealthy|poverty)\s+(people|person|man|woman)\b/i,
    /\b(upper|lower|middle)\s+class\b/i,
    /\b(privileged|underprivileged)\b/i,

    // Enhanced socioeconomic bias patterns
    /\b(legacy|donor|connections|network|old\s+boys)\b/i,
    /\b(community\s+college|trade\s+school|vocational)\s+(vs|versus|compared\s+to)\s+(university|college|ivy)/i,
    /\b(working\s+class|blue\s+collar|white\s+collar)\b/i,
    /\b(entitled|deserving|undeserving)\s+(of\s+)?\b(opportunity|success|help)/i,
    /\b(bootstraps|pull\s+yourself\s+up|meritocracy)\b/i
  ],

  ability_bias: [
    // Existing patterns
    /\b(disabled|handicapped|retarded|crazy|insane|bonkers)\b/i,
    /\b(normal|abnormal)\s+(people|person|man|woman)\b/i,
    /\b(mental|physical)\s+(illness|disability)\b/i,

    // Enhanced ability bias patterns
    /\b(special\s+needs|challenged|differently\s+abled)\b/i,
    /\b(high\s+functioning|low\s+functioning)\b/i,
    /\b(neurotypical|neurodivergent|on\s+the\s+spectrum)\b/i,
    /\b(cure|fix|normal)\b.*\b(autism|adhd|disability)/i,
    /\b(inspirational|heroic|brave)\s+(despite|in\s+spite\s+of)\s+(disability|condition)/i,

    // Ability bias: problematic framing of disability
    /\b(confined\s+to|trapped\s+in|stuck\s+in)\s+(a\s+)?wheelchair\b/i
  ],

  immigration_bias: [
    // Immigration and citizenship bias patterns
    /\b(illegal|undocumented|alien)\s+(immigrant|migrant|worker)\b/i,
    /\b(deportation|deport|remove|send\s+back)\s+(effort|program|policy|raid)\b/i,
    /\b(build\s+(the\s+)?wall|border\s+security|immigration\s+control)\b/i,
    /\b(anchor\s+baby|birthright\s+citizenship|chain\s+migration)\b/i,
    /\b(go\s+back\s+to\s+(your\s+country|where\s+you\s+came\s+from))\b/i,
    /\b(foreign|immigrant)\s+(accent|name|background|sounding)\b/i,
    /\b(dreamer|daca|amnesty|path\s+to\s+citizenship)\b/i,
    /\b(assimilate|integrate|belong\s+here|melt\s+into\s+society)\b/i,
    /\b(detained|targeted|bogus\s+charge)\s+(for\s+)?\b(deportation|immigration)\b/i,
    // Removed: too broad - would flag any mention of ethnic names
    // Match names with bias-related context (e.g., "hard to pronounce Rodriguez", "foreign-sounding Garcia")
    /\b(DeJesus|Rodriguez|Garcia|Hernandez|Martinez|Lopez|Gonzalez|Perez|Sanchez|Ramirez)\b.*\b(foreign|immigrant|ethnic|sounding|different|unusual|hard\s+to\s+pronounce|difficult\s+name|can't\s+pronounce|strange|weird)\b/i,
    /\b(foreign|immigrant|ethnic|sounding|different|unusual|hard\s+to\s+pronounce|difficult|strange|weird)\b.*\b(DeJesus|Rodriguez|Garcia|Hernandez|Martinez|Lopez|Gonzalez|Perez|Sanchez|Ramirez)\b/i
  ],

  coded_bias: [
    // Coded language and microaggressions
    /\b(articulate|well-spoken|professional)\s+(for\s+(a|an)\s+)?\b(black|brown|person|woman)/i,
    /\b(aggressive|angry|hostile)\s+(when\s+)?\b(black|brown|person|woman)/i,
    /\b(clean|presentable|well-groomed)\s+(for\s+(a|an)\s+)?\b(black|brown|person)/i,
    /\b(urban|street|authentic)\s+(culture|vibe|experience)/i,
    /\b(hood|projects|ghetto)\s+(mentality|attitude|lifestyle)/i,
    /\b(food\s+stamps|welfare|section\s+8)\b/i,
    /\b(affirmative\s+action|quota\s+system|diversity\s+hire)/i,
    /\b(reverse\s+discrimination|playing\s+the\s+race\s+card)/i,
    /\b(political\s+correctness|PC|censorship|free\s+speech)\b/i,

    // Note: Removed brown-bag, cakewalk, colored, elderly, and "long time no see"
    // due to high false positive rates in common modern usage
    /\b(born\s+in\s+the\s+usa|born\s+in\s+america)\s+(but|yet|although)\s+(accent|english)/i
  ]
};

// Export patterns for use in bias detection engine
export const BIAS_CATEGORIES = Object.keys(ENHANCED_PATTERNS);

// Import constants (with fallback for service worker context)
import { BIAS_DETECTION_CONSTANTS } from './constants.js';
const constants = BIAS_DETECTION_CONSTANTS || (typeof self !== 'undefined' && self.AiGuardianBiasDetection && self.AiGuardianBiasDetection.constants);

export const PATTERN_WEIGHTS = constants ? constants.PATTERN_WEIGHTS : {
  // Direct evidence (highest confidence)
  direct_bias: 0.4,       // "men are better than women at programming"
  explicit_comparison: 0.35, // "men vs women in tech"

  // Stereotype evidence (medium confidence)
  stereotype: 0.25,       // "women are naturally nurturing"
  role_assignment: 0.22,  // "women belong in the kitchen"
  trait_assignment: 0.20, // "emotional women, logical men"

  // Assumption evidence (lower confidence)
  assumption: 0.15,       // "girls like pink"
  preference_generalization: 0.12, // "women prefer shopping"

  // Coded/subtle evidence (lowest confidence)
  coded: 0.1,            // "urban youth culture"
  microaggression: 0.08,  // "articulate for a black person"
  systemic_hint: 0.06    // "legacy admissions"
};

// Make available globally for service worker context
if (typeof self !== 'undefined') {
  self.AiGuardianBiasDetection = self.AiGuardianBiasDetection || {};
  self.AiGuardianBiasDetection.patterns = ENHANCED_PATTERNS;
  self.AiGuardianBiasDetection.categories = BIAS_CATEGORIES;
  self.AiGuardianBiasDetection.weights = PATTERN_WEIGHTS;
}

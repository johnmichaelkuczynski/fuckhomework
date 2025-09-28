// Word counting and ZHI pricing utilities

export function countWords(text: string): number {
  // Count words by splitting on whitespace and filtering empty strings
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function estimateOutputWords(inputText: string): number {
  // Estimate output words based on input complexity
  const inputWords = countWords(inputText);
  
  // For homework assignments, output is typically 2-3x input length
  // Math problems tend to have longer explanations
  const isMathProblem = /\b(solve|equation|calculate|derivative|integral|limit|matrix|algebra|geometry|calculus|statistics|probability)\b/i.test(inputText);
  
  if (isMathProblem) {
    return Math.min(inputWords * 3, 1000); // Cap at 1000 words
  }
  
  return Math.min(inputWords * 2, 800); // Cap at 800 words
}

export function truncateResponse(response: string, maxWords: number): string {
  const words = response.trim().split(/\s+/);
  
  if (words.length <= maxWords) {
    return response;
  }
  
  // Take the first maxWords and try to break at a sentence end
  const truncated = words.slice(0, maxWords).join(' ');
  const lastPeriod = truncated.lastIndexOf('.');
  const lastNewline = truncated.lastIndexOf('\n');
  
  const breakPoint = Math.max(lastPeriod, lastNewline);
  
  if (breakPoint > truncated.length * 0.8) {
    return truncated.substring(0, breakPoint + 1);
  }
  
  return truncated + '...';
}

// ZHI Pricing Structure - Words per Dollar
export const ZHI_PRICING = {
  ZHI_1: {
    provider: 'anthropic',
    name: 'ZHI 1 (Anthropic)',
    wordsPerDollar: 1154250, // $100 → 115,425,000 words
    merits: 'Fast, cheap, widely compatible. Good balance of creativity + accuracy. Reliable at short/medium rewrites and commercial text.',
    demerits: 'Struggles with very dense scholarly material (drops nuance). More "AI-detected" feel in raw outputs (less human signal). Occasionally hallucinates stylistic quirks.'
  },
  ZHI_2: {
    provider: 'openai', 
    name: 'ZHI 2 (OpenAI)',
    wordsPerDollar: 28834, // $100 → 2,883,400 words
    merits: 'Excellent on scholarly, philosophical, and "thinking-through" tasks. Strong at staying consistent in long rewrites. More "polished" tone, good for academic-sounding prose.',
    demerits: 'By far the most expensive. Sometimes cautious / verbose, especially when asked for edgy or non-academic rewrites. Can "over-summarize" instead of fully transforming.'
  },
  ZHI_3: {
    provider: 'deepseek',
    name: 'ZHI 3 (DeepSeek)',
    wordsPerDollar: 189540, // $100 → 18,954,000 words
    merits: 'Cheapest by far. Handles bulk text rewriting and simple transformations well. Decent logical coherence, especially for structured rewriting.',
    demerits: 'Noticeably slower than the others. Less nuanced on subtle philosophy/literature than Anthropic. Output can feel mechanical if pushed beyond bulk processing.'
  },
  ZHI_4: {
    provider: 'perplexity',
    name: 'ZHI 4 (Perplexity)',
    wordsPerDollar: 1731769, // $100 → 173,176,900 words
    merits: 'Very cheap for API calls (currently subsidized). Good for quick turnarounds, exploratory rewrites. Sometimes surprisingly concise and pointed.',
    demerits: 'Quality varies — can be shallow compared to Anthropic/OpenAI. Weak on sustained long-form consistency. Infrastructure less mature, risk of pricing changing abruptly.'
  }
};

// Credit purchase tiers with word allocations per ZHI
export const CREDIT_TIERS = {
  '5': {
    ZHI_1: 4275000,    // $5 → 4,275,000 words
    ZHI_2: 106840,     // $5 → 106,840 words  
    ZHI_3: 702000,     // $5 → 702,000 words
    ZHI_4: 6410255     // $5 → 6,410,255 words
  },
  '10': {
    ZHI_1: 8977500,   // $10 → 8,977,500 words
    ZHI_2: 224360,    // $10 → 224,360 words
    ZHI_3: 1474200,   // $10 → 1,474,200 words
    ZHI_4: 13461530   // $10 → 13,461,530 words
  },
  '25': {
    ZHI_1: 23512500,  // $25 → 23,512,500 words
    ZHI_2: 587625,    // $25 → 587,625 words
    ZHI_3: 3861000,   // $25 → 3,861,000 words
    ZHI_4: 35256400   // $25 → 35,256,400 words
  },
  '50': {
    ZHI_1: 51300000,  // $50 → 51,300,000 words
    ZHI_2: 1282100,   // $50 → 1,282,100 words
    ZHI_3: 8424000,   // $50 → 8,424,000 words
    ZHI_4: 76923050   // $50 → 76,923,050 words
  },
  '100': {
    ZHI_1: 115425000, // $100 → 115,425,000 words
    ZHI_2: 2883400,   // $100 → 2,883,400 words
    ZHI_3: 18954000,  // $100 → 18,954,000 words
    ZHI_4: 173176900  // $100 → 173,176,900 words
  }
};

// Free tier limits (based on word count now)
export const FREE_LIMITS = {
  INPUT_LIMIT: 200,    // 200 words max input
  OUTPUT_LIMIT: 150,   // 150 words max output
  DAILY_LIMIT: 500     // 500 words total per day
};

// Calculate word credits to deduct based on provider
export function calculateWordCost(inputWords: number, outputWords: number, provider: string): number {
  const totalWords = inputWords + outputWords;
  
  // Find the ZHI that matches this provider
  const zhiEntry = Object.values(ZHI_PRICING).find(zhi => zhi.provider === provider);
  if (!zhiEntry) {
    console.warn(`Unknown provider: ${provider}, using ZHI_1 pricing`);
    return Math.ceil(totalWords / ZHI_PRICING.ZHI_1.wordsPerDollar * 100); // Convert to credits (cents)
  }
  
  // Calculate cost in cents (credits)
  return Math.ceil(totalWords / zhiEntry.wordsPerDollar * 100);
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}
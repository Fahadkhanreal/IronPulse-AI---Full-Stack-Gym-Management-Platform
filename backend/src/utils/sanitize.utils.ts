/**
 * Input sanitization utility to prevent prompt injection attacks
 */

export interface SanitizationResult {
  sanitized: string;
  isSuspicious: boolean;
  detectedPatterns: string[];
}

// Suspicious patterns that might indicate prompt injection attempts
const SUSPICIOUS_PATTERNS = [
  /ignore\s+(previous|all)\s+instructions?/i,
  /you\s+are\s+now/i,
  /new\s+(role|instructions?|system\s+prompt)/i,
  /disregard\s+(previous|all)/i,
  /forget\s+(everything|all|previous)/i,
  /act\s+as\s+(if|a)/i,
  /pretend\s+(to\s+be|you\s+are)/i,
  /system\s*:\s*/i,
  /assistant\s*:\s*/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<\|.*?\|>/g,
  /###\s*(System|Assistant|User)\s*:/i,
];

// Instruction markers to remove
const INSTRUCTION_MARKERS = [
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /###\s*(System|Assistant|User)\s*:/gi,
  /<\|.*?\|>/g,
];

/**
 * Sanitize user input to prevent prompt injection
 */
export function sanitizeInput(userMessage: string): SanitizationResult {
  const detectedPatterns: string[] = [];
  let sanitized = userMessage;

  // 1. Remove instruction markers
  for (const marker of INSTRUCTION_MARKERS) {
    if (marker.test(sanitized)) {
      detectedPatterns.push(`Instruction marker: ${marker.source}`);
      sanitized = sanitized.replace(marker, '');
    }
  }

  // 2. Limit length (prevent token exhaustion attacks)
  const maxLength = 500;
  if (sanitized.length > maxLength) {
    detectedPatterns.push(`Length exceeded: ${sanitized.length} > ${maxLength}`);
    sanitized = sanitized.slice(0, maxLength);
  }

  // 3. Detect suspicious patterns
  let isSuspicious = false;
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      isSuspicious = true;
      detectedPatterns.push(`Suspicious pattern: ${pattern.source}`);
    }
  }

  // 4. Trim whitespace
  sanitized = sanitized.trim();

  // Log suspicious activity
  if (isSuspicious || detectedPatterns.length > 0) {
    console.warn('⚠️  Potential prompt injection detected:', {
      original: userMessage.substring(0, 100),
      detectedPatterns,
      isSuspicious,
    });
  }

  return {
    sanitized,
    isSuspicious,
    detectedPatterns,
  };
}

/**
 * Filter LLM response to remove leaked system prompts
 */
export function filterResponse(response: string): string {
  let filtered = response;

  // Remove accidentally leaked system prompt fragments
  filtered = filtered.replace(/\*\*Security Rules\*\*.*$/s, '');
  filtered = filtered.replace(/\[SYSTEM\].*?\[\/SYSTEM\]/gs, '');
  filtered = filtered.replace(/\[INTERNAL\].*?\[\/INTERNAL\]/gs, '');

  // Remove instruction markers that might have leaked
  for (const marker of INSTRUCTION_MARKERS) {
    filtered = filtered.replace(marker, '');
  }

  return filtered.trim();
}

/**
 * Validate message content
 */
export function validateMessage(message: string): { valid: boolean; error?: string } {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (message.length > 500) {
    return { valid: false, error: 'Message must be 500 characters or less' };
  }

  // Check for null bytes or other control characters
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(message)) {
    return { valid: false, error: 'Message contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Escape special characters for safe logging
 */
export function escapeForLog(text: string): string {
  return text
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .substring(0, 200); // Limit log length
}

/**
 * Check if input contains potential SQL injection patterns
 * (Defense in depth - Prisma already protects against this)
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b).*(\bFROM\b|\bWHERE\b|\bINTO\b)/i,
    /--/,
    /;.*(\bDROP\b|\bDELETE\b|\bTRUNCATE\b)/i,
    /'\s*OR\s*'1'\s*=\s*'1/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Check if input contains potential XSS patterns
 */
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Comprehensive security check
 */
export function securityCheck(input: string): {
  safe: boolean;
  threats: string[];
} {
  const threats: string[] = [];

  if (detectSQLInjection(input)) {
    threats.push('SQL injection pattern detected');
  }

  if (detectXSS(input)) {
    threats.push('XSS pattern detected');
  }

  const { isSuspicious, detectedPatterns } = sanitizeInput(input);
  if (isSuspicious) {
    threats.push('Prompt injection pattern detected');
    threats.push(...detectedPatterns);
  }

  return {
    safe: threats.length === 0,
    threats,
  };
}

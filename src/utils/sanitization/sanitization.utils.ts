// XSS attack patterns to detect
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>/gi,
  /<link[^>]*>/gi,
  /<meta[^>]*>/gi,
  /<img[^>]*onerror\s*=/gi,
  /<img[^>]*onload\s*=/gi,
  /<[^>]*on\w+\s*=/gi, // Any tag with event handlers
  /<body[^>]*>/gi, // Body tag
  /<form[^>]*>/gi, // Form tag
  /<input[^>]*>/gi, // Input tag without proper validation
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  /<svg[^>]*onload\s*=/gi,
  /<style[^>]*>.*?<\/style>/gi,
  /expression\s*\(/gi, // CSS expressions
  /@import/gi,
  /&#x?[0-9a-f]+;/gi, // HTML entities that could be malicious
];

// Error messages for XSS detection
export const XSS_ERROR_MESSAGE = 'Invalid content';

/**
 * Check if a string contains potential XSS patterns
 * @param input - The input string to check
 * @returns True if XSS patterns are detected
 */
export const containsXSS = (input: string | null | undefined): boolean => {
  if (!input || typeof input !== 'string') return false;
  
  // Check against all XSS patterns
  return XSS_PATTERNS.some(pattern => pattern.test(input));
};

/**
 * Strip all HTML tags from a string (for plain text)
 * @param input - The input string
 * @returns String with all HTML tags removed
 */
export const stripHtmlTags = (input: string | null | undefined): string => {
  if (!input || typeof input !== 'string') return input || '';
  
  // Remove all HTML tags
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .trim();
};

/**
 * Sanitize form input to prevent XSS
 * @param input - The form input
 * @returns Sanitized input
 */
export const sanitizeFormInput = (input: string | null | undefined): string => {
  if (!input || typeof input !== 'string') return input || '';
  
  // For form inputs, strip all HTML tags
  return stripHtmlTags(input);
};


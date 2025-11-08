// Utility function to parse source citations from Gemini responses
// Supports formats:
// - *Source: Name (https://url.com)*
// - *Source: Name*
// - Source: Name (https://url.com)
// - Source: Name

export const parseSource = (text) => {
  if (!text) return { content: text, sourceName: null, sourceUrl: null };
  
  // Try to match format: *Source: Name (https://url.com)*
  const sourceMatch = text.match(/\*Source:\s*([^(]+)\s*\(([^)]+)\)\*/);
  if (sourceMatch) {
    const content = text.replace(/\*Source:.*/, '').trim();
    return {
      content,
      sourceName: sourceMatch[1].trim(),
      sourceUrl: sourceMatch[2].trim()
    };
  }
  
  // Try format: Source: Name (https://url.com) (without asterisks)
  const sourceMatch2 = text.match(/Source:\s*([^(]+)\s*\(([^)]+)\)/);
  if (sourceMatch2) {
    const content = text.replace(/Source:.*/, '').trim();
    return {
      content,
      sourceName: sourceMatch2[1].trim(),
      sourceUrl: sourceMatch2[2].trim()
    };
  }
  
  // Try format: *Source: Name* (without URL)
  const simpleMatch = text.match(/\*Source:\s*([^*]+)\*/);
  if (simpleMatch) {
    const content = text.replace(/\*Source:.*/, '').trim();
    return {
      content,
      sourceName: simpleMatch[1].trim(),
      sourceUrl: null
    };
  }
  
  // Try format: Source: Name (without asterisks and URL)
  const simpleMatch2 = text.match(/Source:\s*([^\n]+)/);
  if (simpleMatch2) {
    const content = text.replace(/Source:.*/, '').trim();
    return {
      content,
      sourceName: simpleMatch2[1].trim(),
      sourceUrl: null
    };
  }
  
  // No source found
  return {
    content: text,
    sourceName: null,
    sourceUrl: null
  };
};


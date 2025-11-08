// Utility to format Gemini text responses - removes markdown and formats nicely
export const formatText = (text) => {
  if (!text) return '';
  
  // Split by paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  return paragraphs.map((para, idx) => {
    if (!para.trim()) return null;
    
    // Remove markdown bold (**text** or __text__)
    let formatted = para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Remove markdown italic (*text* or _text_)
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Remove markdown headings (# ## ###)
    formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    
    // Remove markdown list markers (-, *, 1.)
    formatted = formatted.replace(/^[-*]\s+(.+)$/gm, '• $1');
    formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '$1');
    
    // Clean up extra spaces
    formatted = formatted.trim();
    
    return (
      <div key={idx} className="mb-3" dangerouslySetInnerHTML={{ __html: formatted }} />
    );
  }).filter(Boolean);
};

// Clean and simplify text response
export const cleanText = (text) => {
  if (!text) return '';
  
  // Remove excessive markdown formatting
  let cleaned = text
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove **bold**
    .replace(/__(.+?)__/g, '$1')     // Remove __bold__
    .replace(/\*(.+?)\*/g, '$1')     // Remove *italic*
    .replace(/_(.+?)_/g, '$1')       // Remove _italic_
    .replace(/^#{1,6}\s+/gm, '')     // Remove headings
    .replace(/^[-*]\s+/gm, '')       // Remove list markers
    .replace(/^\d+\.\s+/gm, '')      // Remove numbered lists
    .trim();
  
  // Limit to reasonable length (max 800 words or ~5000 chars)
  const words = cleaned.split(/\s+/);
  if (words.length > 800) {
    cleaned = words.slice(0, 800).join(' ') + '...';
  }
  
  return cleaned;
};


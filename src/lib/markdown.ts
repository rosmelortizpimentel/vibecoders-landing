/**
 * Simple markdown parser for basic formatting
 * Supports: bold, italic, and unordered lists
 */

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };
  return text.replace(/[&<>"']/g, char => htmlEscapes[char]);
}

export function parseMarkdown(text: string): string {
  if (!text) return '';

  let html = escapeHtml(text);

  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Unordered lists: - item
  const lines = html.split('\n');
  let inList = false;
  const processedLines: string[] = [];

  lines.forEach(line => {
    const listMatch = line.match(/^-\s+(.+)$/);
    if (listMatch) {
      if (!inList) {
        processedLines.push('<ul class="list-disc pl-4 my-2">');
        inList = true;
      }
      processedLines.push(`<li>${listMatch[1]}</li>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push(line);
    }
  });

  if (inList) {
    processedLines.push('</ul>');
  }

  html = processedLines.join('\n');

  // Convert line breaks to <br> (except inside lists)
  html = html.replace(/\n(?!<\/?(ul|li))/g, '<br>');

  return html;
}

// For preview, we just show the text with formatting indicators visible
export function previewMarkdownText(text: string, maxLength: number = 100): string {
  if (!text) return '';
  
  // Remove markdown syntax for preview
  let preview = text
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/\*/g, '')
    .replace(/_/g, '')
    .replace(/^-\s+/gm, '• ');

  if (preview.length > maxLength) {
    preview = preview.substring(0, maxLength) + '...';
  }

  return preview;
}

/**
 * Enhanced markdown parser for beta instructions
 * Supports: bold, italic, underline, unordered lists, numbered lists
 */
import DOMPurify from 'dompurify';

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

  let html = text;

  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Underline: ~~text~~
  html = html.replace(/~~(.+?)~~/g, '<u>$1</u>');

  // Process lines for lists
  const lines = html.split('\n');
  let inUnorderedList = false;
  let inOrderedList = false;
  const processedLines: string[] = [];

  lines.forEach(line => {
    const unorderedMatch = line.match(/^-\s+(.+)$/);
    const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/);

    if (unorderedMatch) {
      // Close ordered list if open
      if (inOrderedList) {
        processedLines.push('</ol>');
        inOrderedList = false;
      }
      // Open unordered list if not open
      if (!inUnorderedList) {
        processedLines.push('<ul class="list-disc pl-4 my-2 space-y-1">');
        inUnorderedList = true;
      }
      processedLines.push(`<li>${unorderedMatch[1]}</li>`);
    } else if (orderedMatch) {
      // Close unordered list if open
      if (inUnorderedList) {
        processedLines.push('</ul>');
        inUnorderedList = false;
      }
      // Open ordered list if not open
      if (!inOrderedList) {
        processedLines.push('<ol class="list-decimal pl-4 my-2 space-y-1">');
        inOrderedList = true;
      }
      processedLines.push(`<li>${orderedMatch[2]}</li>`);
    } else {
      // Close any open lists
      if (inUnorderedList) {
        processedLines.push('</ul>');
        inUnorderedList = false;
      }
      if (inOrderedList) {
        processedLines.push('</ol>');
        inOrderedList = false;
      }
      processedLines.push(line);
    }
  });

  // Close any remaining open lists
  if (inUnorderedList) {
    processedLines.push('</ul>');
  }
  if (inOrderedList) {
    processedLines.push('</ol>');
  }

  html = processedLines.join('\n');

  // Auto-linkify raw URLs (http:// or https://) not already in an href attribute
  html = html.replace(/(?<!href=["'])(https?:\/\/[^\s<]+)/gi, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-[#3D5AFE] hover:underline break-all">$1</a>');

  // Convert line breaks to <br> (except inside lists)
  html = html.replace(/\n(?!<\/?(ul|ol|li))/g, '<br>');

  // Final XSS sanitization, ensuring target attribute is preserved
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}

// For preview, we just show the text with formatting indicators visible
export function previewMarkdownText(text: string, maxLength: number = 100): string {
  if (!text) return '';
  
  // Remove markdown syntax for preview
  let preview = text
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/~~/g, '')
    .replace(/\*/g, '')
    .replace(/_/g, '')
    .replace(/^-\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, '• ');

  if (preview.length > maxLength) {
    preview = preview.substring(0, maxLength) + '...';
  }

  return preview;
}

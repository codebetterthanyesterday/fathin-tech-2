import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const CLIENT_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span', 'img',
    'del', 'details', 'summary', 'kbd', 'sup', 'sub'
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel', 'class'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'class'],
    span: ['style', 'class'],
    code: ['style', 'class'],
    pre: ['style', 'class'],
    div: ['style', 'class'],
    th: ['align', 'colspan', 'rowspan'],
    td: ['align', 'colspan', 'rowspan'],
    '*': ['id'],
  },
};

/**
 * Fast synchronous markdown renderer for Admin Live Preview editor.
 */
export function renderMarkdownClient(contentMd: string): string {
  if (!contentMd) return '';
  try {
    const rawHtml = marked.parse(contentMd, {
      gfm: true,
      breaks: true,
      async: false,
    }) as string;

    return sanitizeHtml(rawHtml, CLIENT_SANITIZE_OPTIONS);
  } catch (err) {
    console.error('Client markdown render error:', err);
    return '<p class="text-red-400">Error rendering markdown preview</p>';
  }
}

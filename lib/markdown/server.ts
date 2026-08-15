import { marked } from 'marked';
import { codeToHtml } from 'shiki';
import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
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
    pre: ['style', 'class', 'tabindex'],
    div: ['style', 'class'],
    th: ['align', 'colspan', 'rowspan'],
    td: ['align', 'colspan', 'rowspan'],
    '*': ['id', 'aria-hidden'],
  },
  allowedStyles: {
    '*': {
      'color': [/.*/],
      'background-color': [/.*/],
      'background': [/.*/],
      'font-style': [/.*/],
      'font-weight': [/.*/],
      'text-decoration': [/.*/],
      '--shiki-dark': [/.*/],
      '--shiki-dark-bg': [/.*/],
    },
  },
};

/**
 * Server-side markdown renderer that runs 100% on the server.
 * Uses Shiki for dark-themed syntax highlighting and sanitize-html for safety.
 * Zero highlighter JavaScript is sent to the client.
 */
export async function renderMarkdownServer(contentMd: string): Promise<string> {
  if (!contentMd) return '';

  // Configure marked to intercept code blocks with Shiki
  const renderer = new marked.Renderer();

  renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
    // Note: marked v18 sync vs async renderer
    // We will handle highlighting via token walker or post-processing placeholder
    return `<pre><code class="language-${lang || 'text'}">${escapeHtml(text)}</code></pre>`;
  };

  marked.setOptions({
    renderer,
    gfm: true,
    breaks: true,
  });

  const rawHtml = await marked.parse(contentMd);

  // Replace <pre><code class="language-xyz">...</code></pre> with Shiki highlighting
  const highlightedHtml = await replaceCodeBlocksWithShiki(rawHtml);

  // Sanitize the final HTML
  return sanitizeHtml(highlightedHtml, SANITIZE_OPTIONS);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function unescapeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'");
}

async function replaceCodeBlocksWithShiki(html: string): Promise<string> {
  const codeBlockRegex = /<pre><code(?:\s+class="language-([a-zA-Z0-9_\-]+)")?>([\s\S]*?)<\/code><\/pre>/g;
  const matches = [...html.matchAll(codeBlockRegex)];

  if (matches.length === 0) return html;

  let result = html;

  for (const match of matches) {
    const fullMatch = match[0];
    const rawLang = match[1] || 'text';
    const rawCode = unescapeHtml(match[2]);

    try {
      const highlighted = await codeToHtml(rawCode, {
        lang: rawLang,
        theme: 'github-dark',
      });
      result = result.replace(fullMatch, highlighted);
    } catch {
      // Fallback for unsupported language: highlight as text/markdown
      try {
        const highlighted = await codeToHtml(rawCode, {
          lang: 'text',
          theme: 'github-dark',
        });
        result = result.replace(fullMatch, highlighted);
      } catch {
        // Keep original if even text fails
      }
    }
  }

  return result;
}

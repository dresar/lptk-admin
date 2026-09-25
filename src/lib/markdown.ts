/**
 * Markdown & SEO Utilities for Blog & News
 */

export interface SeoCheck {
  id: string;
  label: string;
  passed: boolean;
  message: string;
  severity: 'good' | 'warning' | 'error';
}

export interface SeoAuditResult {
  score: number;
  grade: 'Optimal' | 'Cukup' | 'Perlu Perbaikan';
  checks: SeoCheck[];
}

/**
 * Extracts a clean embed URL from various YouTube link formats
 */
export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Standard watch URL: youtube.com/watch?v=ID
  const watchMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}`;
  }

  // Already an embed URL
  if (trimmed.includes('youtube.com/embed/') || trimmed.includes('youtube-nocookie.com/embed/')) {
    return trimmed;
  }

  return null;
}

/**
 * Checks if a URL is a direct video file (mp4, webm, ogg)
 */
export function isDirectVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.ogg');
}

/**
 * Lightweight, robust Markdown to HTML compiler
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split(/\r?\n/);
  const htmlLines: string[] = [];
  let inList: 'ul' | 'ol' | null = null;
  let inBlockquote = false;
  let inTable = false;

  const closeList = () => {
    if (inList) {
      htmlLines.push(`</${inList}>`);
      inList = null;
    }
  };

  const closeBlockquote = () => {
    if (inBlockquote) {
      htmlLines.push('</blockquote>');
      inBlockquote = false;
    }
  };

  const closeTable = () => {
    if (inTable) {
      htmlLines.push('</tbody></table></div>');
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Empty line
    if (!line.trim()) {
      closeList();
      closeBlockquote();
      closeTable();
      continue;
    }

    // Markdown Table Row
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      closeList();
      closeBlockquote();

      const cells = line
        .trim()
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      // Divider row (|---|---|)
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        htmlLines.push('<div class="overflow-x-auto my-4"><table class="w-full text-xs sm:text-sm border border-neutral-300"><tbody>');
      }

      const rowHtml = cells.map((c) => `<td class="border border-neutral-300 px-3 py-2">${parseInline(c)}</td>`).join('');
      htmlLines.push(`<tr>${rowHtml}</tr>`);
      continue;
    } else {
      closeTable();
    }

    // Headings
    if (line.startsWith('#### ')) {
      closeList();
      closeBlockquote();
      htmlLines.push(`<h4 class="text-sm sm:text-base font-bold text-neutral-900 mt-5 mb-2">${parseInline(line.slice(5))}</h4>`);
      continue;
    }
    if (line.startsWith('### ')) {
      closeList();
      closeBlockquote();
      htmlLines.push(`<h3 class="text-base sm:text-lg font-bold text-neutral-900 mt-6 mb-2.5">${parseInline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      closeList();
      closeBlockquote();
      htmlLines.push(`<h2 class="text-lg sm:text-xl font-extrabold text-neutral-900 mt-7 mb-3 pb-1 border-b border-neutral-200">${parseInline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      closeList();
      closeBlockquote();
      htmlLines.push(`<h1 class="text-xl sm:text-2xl font-black text-neutral-900 mt-8 mb-4">${parseInline(line.slice(2))}</h1>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      closeList();
      if (!inBlockquote) {
        inBlockquote = true;
        htmlLines.push('<blockquote class="border-l-4 border-emerald-700 bg-stone-50 pl-4 py-2 my-4 text-xs sm:text-sm italic text-neutral-700">');
      }
      htmlLines.push(`<p class="my-1">${parseInline(line.slice(2))}</p>`);
      continue;
    } else {
      closeBlockquote();
    }

    // Unordered List
    if (/^[\*\-]\s+/.test(line)) {
      closeBlockquote();
      if (inList !== 'ul') {
        closeList();
        inList = 'ul';
        htmlLines.push('<ul class="list-disc pl-5 my-3 space-y-1 text-xs sm:text-sm text-neutral-800">');
      }
      const itemContent = line.replace(/^[\*\-]\s+/, '');
      htmlLines.push(`<li>${parseInline(itemContent)}</li>`);
      continue;
    }

    // Ordered List
    if (/^\d+\.\s+/.test(line)) {
      closeBlockquote();
      if (inList !== 'ol') {
        closeList();
        inList = 'ol';
        htmlLines.push('<ol class="list-decimal pl-5 my-3 space-y-1 text-xs sm:text-sm text-neutral-800">');
      }
      const itemContent = line.replace(/^\d+\.\s+/, '');
      htmlLines.push(`<li>${parseInline(itemContent)}</li>`);
      continue;
    }

    // Horizontal Rule
    if (/^(---|___|\*\*\*)$/.test(line.trim())) {
      closeList();
      closeBlockquote();
      htmlLines.push('<hr class="my-6 border-neutral-300" />');
      continue;
    }

    closeList();
    closeBlockquote();

    // Raw HTML line pass-through
    if (line.trim().startsWith('<') && line.trim().endsWith('>')) {
      htmlLines.push(line);
      continue;
    }

    // Regular Paragraph
    htmlLines.push(`<p class="my-3 leading-relaxed text-xs sm:text-sm text-neutral-800">${parseInline(line)}</p>`);
  }

  closeList();
  closeBlockquote();
  closeTable();

  return htmlLines.join('\n');
}

/**
 * Parse inline markdown elements (bold, italic, links, images, code)
 */
function parseInline(text: string): string {
  let parsed = text;

  // Images: ![alt](url)
  parsed = parsed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-md border border-neutral-200 max-h-96 w-auto object-cover" />');

  // Links: [text](url)
  parsed = parsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-700 font-semibold underline hover:text-emerald-900">$1</a>');

  // Bold: **text** or __text__
  parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-neutral-950">$1</strong>');
  parsed = parsed.replace(/__(.*?)__/g, '<strong class="font-bold text-neutral-950">$1</strong>');

  // Italic: *text* or _text_
  parsed = parsed.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  parsed = parsed.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

  // Strikethrough: ~~text~~
  parsed = parsed.replace(/~~(.*?)~~/g, '<del class="line-through text-neutral-500">$1</del>');

  // Inline Code: `code`
  parsed = parsed.replace(/`([^`]+)`/g, '<code class="bg-stone-100 text-emerald-900 px-1.5 py-0.5 rounded font-mono text-[11px] border border-stone-200">$1</code>');

  return parsed;
}

/**
 * Evaluates SEO metrics for a post
 */
export function calculateSeoAudit(post: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  cover_image_url?: string | null;
}): SeoAuditResult {
  const checks: SeoCheck[] = [];
  let score = 0;

  // 1. Title Length Audit (Optimal 40 - 70 chars)
  const titleLen = post.title.trim().length;
  if (titleLen >= 30 && titleLen <= 70) {
    checks.push({
      id: 'title_length',
      label: 'Panjang Judul',
      passed: true,
      message: `Panjang judul ideal (${titleLen} karakter).`,
      severity: 'good',
    });
    score += 15;
  } else if (titleLen > 0) {
    checks.push({
      id: 'title_length',
      label: 'Panjang Judul',
      passed: false,
      message: titleLen < 30 ? `Judul terlalu pendek (${titleLen} karakter). Rekomendasi: 30–70 karakter.` : `Judul terlalu panjang (${titleLen} karakter). Rekomendasi: 30–70 karakter.`,
      severity: 'warning',
    });
    score += 8;
  } else {
    checks.push({
      id: 'title_length',
      label: 'Panjang Judul',
      passed: false,
      message: 'Judul belum diisi.',
      severity: 'error',
    });
  }

  // 2. Slug SEO Quality
  const isSlugClean = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(post.slug);
  if (isSlugClean && post.slug.length >= 5) {
    checks.push({
      id: 'slug_clean',
      label: 'Slug URL',
      passed: true,
      message: 'Slug URL rapi, menggunakan tanda hubung, dan ramah mesin pencari.',
      severity: 'good',
    });
    score += 15;
  } else {
    checks.push({
      id: 'slug_clean',
      label: 'Slug URL',
      passed: false,
      message: 'Slug harus berupa huruf kecil dan tanda hubung (-).',
      severity: 'error',
    });
  }

  // 3. Meta Description (or Excerpt) Length
  const desc = (post.meta_description || post.excerpt || '').trim();
  const descLen = desc.length;
  if (descLen >= 80 && descLen <= 165) {
    checks.push({
      id: 'meta_desc',
      label: 'Meta Deskripsi / Ringkasan',
      passed: true,
      message: `Panjang deskripsi cuplikan pencarian optimal (${descLen} karakter).`,
      severity: 'good',
    });
    score += 20;
  } else if (descLen > 0) {
    checks.push({
      id: 'meta_desc',
      label: 'Meta Deskripsi / Ringkasan',
      passed: false,
      message: descLen < 80 ? `Deskripsi terlalu singkat (${descLen} karakter). Ideal: 80–160 karakter.` : `Deskripsi melebihi batas cuplikan (${descLen} karakter).`,
      severity: 'warning',
    });
    score += 10;
  } else {
    checks.push({
      id: 'meta_desc',
      label: 'Meta Deskripsi / Ringkasan',
      passed: false,
      message: 'Meta deskripsi atau ringkasan belum diisi.',
      severity: 'error',
    });
  }

  // 4. Content Word Count
  const words = post.content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  if (wordCount >= 200) {
    checks.push({
      id: 'word_count',
      label: 'Panjang Konten',
      passed: true,
      message: `Konten cukup mendalam (${wordCount} kata).`,
      severity: 'good',
    });
    score += 20;
  } else if (wordCount >= 60) {
    checks.push({
      id: 'word_count',
      label: 'Panjang Konten',
      passed: false,
      message: `Konten relatif pendek (${wordCount} kata). Dianjurkan minimal 200 kata.`,
      severity: 'warning',
    });
    score += 10;
  } else {
    checks.push({
      id: 'word_count',
      label: 'Panjang Konten',
      passed: false,
      message: `Konten sangat minim (${wordCount} kata).`,
      severity: 'error',
    });
  }

  // 5. Headings Structure (H2 / H3)
  const hasHeadings = /^(##|###)\s+/m.test(post.content);
  if (hasHeadings) {
    checks.push({
      id: 'heading_structure',
      label: 'Struktur Subjudul (H2/H3)',
      passed: true,
      message: 'Artikel memiliki pembagian subjudul yang memudahkan keterbacaan.',
      severity: 'good',
    });
    score += 15;
  } else {
    checks.push({
      id: 'heading_structure',
      label: 'Struktur Subjudul (H2/H3)',
      passed: false,
      message: 'Belum ada subjudul (H2 / ##). Gunakan subjudul untuk memecah topik.',
      severity: 'warning',
    });
    score += 5;
  }

  // 6. Cover Image
  if (post.cover_image_url && post.cover_image_url.trim().length > 0) {
    checks.push({
      id: 'cover_image',
      label: 'Gambar Sampul',
      passed: true,
      message: 'Gambar sampul terpasang untuk visual media sosial (OpenGraph).',
      severity: 'good',
    });
    score += 15;
  } else {
    checks.push({
      id: 'cover_image',
      label: 'Gambar Sampul',
      passed: false,
      message: 'Belum ada foto sampul untuk cuplikan visual.',
      severity: 'warning',
    });
  }

  let grade: 'Optimal' | 'Cukup' | 'Perlu Perbaikan' = 'Perlu Perbaikan';
  if (score >= 80) grade = 'Optimal';
  else if (score >= 55) grade = 'Cukup';

  return { score: Math.min(100, score), grade, checks };
}

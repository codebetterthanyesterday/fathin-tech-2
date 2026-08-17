import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface SearchResultItem {
  id: string;
  type: 'project' | 'article';
  title: string;
  slug: string;
  url: string;
  snippet: string;
  score: number;
  tags?: string[];
  publishedAt?: string | null;
  featured?: boolean;
}

export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  query: string;
}

/**
 * Helper to build a safe tsquery prefix string.
 * Example: "next port" -> "next:* & port:*"
 */
function buildPrefixTsQuery(rawQuery: string): string {
  const words = rawQuery
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, '') // Keep letters and numbers (Unicode aware)
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return '';
  return words.map((w) => `${w}:*`).join(' & ');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // 'all' | 'project' | 'article'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const offset = (page - 1) * limit;

    const trimmedQuery = rawQuery.trim();

    // Query must be at least 2 characters to trigger search
    if (trimmedQuery.length < 2) {
      return NextResponse.json({
        results: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        query: rawQuery,
      });
    }

    const prefixQuery = buildPrefixTsQuery(trimmedQuery) || trimmedQuery;

    const queries: Promise<any[]>[] = [];

    // Project Search Query
    if (type === 'all' || type === 'project') {
      const projectQuery = prisma.$queryRawUnsafe<any[]>(
        `
        SELECT 
          'project' AS type,
          p.id,
          p.title,
          p.slug,
          ('/projects/' || p.slug) AS url,
          coalesce(p.summary, '') AS snippet,
          p."techStack" AS tags,
          p."isFeatured" AS featured,
          (
            coalesce(ts_rank(p.search_vector, websearch_to_tsquery('simple', $1)), 0.0) * 2.5 +
            coalesce(ts_rank(p.search_vector, to_tsquery('simple', $2)), 0.0) * 1.5 +
            coalesce(similarity(p.title, $1), 0.0) * 2.0 +
            (CASE WHEN p.title ILIKE ('%' || $1 || '%') THEN 1.0 ELSE 0.0 END)
          )::float AS score,
          p."createdAt" AS "publishedAt"
        FROM "Project" p
        WHERE 
          (
            p.search_vector @@ websearch_to_tsquery('simple', $1)
            OR p.search_vector @@ to_tsquery('simple', $2)
            OR similarity(p.title, $1) > 0.15
            OR p.title ILIKE ('%' || $1 || '%')
            OR p.summary ILIKE ('%' || $1 || '%')
          )
        `,
        trimmedQuery,
        prefixQuery
      ).catch((err) => {
        console.error('Project search error:', err);
        return [];
      });

      queries.push(projectQuery);
    }

    // Article Search Query (Strictly unpublished drafts excluded: isPublished = true)
    if (type === 'all' || type === 'article') {
      const articleQuery = prisma.$queryRawUnsafe<any[]>(
        `
        SELECT 
          'article' AS type,
          a.id,
          a.title,
          a.slug,
          ('/articles/' || a.slug) AS url,
          coalesce(a.excerpt, substring(a."contentMd" from 1 for 200), '') AS snippet,
          ARRAY[]::text[] AS tags,
          false AS featured,
          (
            coalesce(ts_rank(a.search_vector, websearch_to_tsquery('simple', $1)), 0.0) * 2.5 +
            coalesce(ts_rank(a.search_vector, to_tsquery('simple', $2)), 0.0) * 1.5 +
            coalesce(similarity(a.title, $1), 0.0) * 2.0 +
            (CASE WHEN a.title ILIKE ('%' || $1 || '%') THEN 1.0 ELSE 0.0 END)
          )::float AS score,
          a."publishedAt" AS "publishedAt"
        FROM "Article" a
        WHERE a."isPublished" = true
          AND (
            a.search_vector @@ websearch_to_tsquery('simple', $1)
            OR a.search_vector @@ to_tsquery('simple', $2)
            OR similarity(a.title, $1) > 0.15
            OR a.title ILIKE ('%' || $1 || '%')
            OR a.excerpt ILIKE ('%' || $1 || '%')
          )
        `,
        trimmedQuery,
        prefixQuery
      ).catch((err) => {
        console.error('Article search error:', err);
        return [];
      });

      queries.push(articleQuery);
    }

    const queryResults = await Promise.all(queries);
    const combined: SearchResultItem[] = queryResults.flat();

    // Sort by descending ranking score
    combined.sort((a, b) => (b.score || 0) - (a.score || 0));

    const total = combined.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedResults = combined.slice(offset, offset + limit);

    return NextResponse.json({
      results: paginatedResults,
      total,
      page,
      limit,
      totalPages,
      query: rawQuery,
    });
  } catch (error) {
    console.error('Unified search route error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during search' },
      { status: 500 }
    );
  }
}

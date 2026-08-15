import { z } from 'zod';

// ─────────────────────────────────────────────
// Per-type content schemas
// ─────────────────────────────────────────────

export const HeroContentSchema = z.object({
  type: z.literal('HERO'),
  ctaLabel: z.string().optional(),   // Override CTA button text
  ctaUrl: z.string().url().optional().or(z.literal('')), // Override CTA URL
});

export const SkillsGridContentSchema = z.object({
  type: z.literal('SKILLS_GRID'),
  categories: z.array(z.string()).optional(), // Filter by category names; empty = all
});

export const ProjectsGridContentSchema = z.object({
  type: z.literal('PROJECTS_GRID'),
  filter: z.enum(['featured', 'all']).default('featured'),
  limit: z.number().int().min(1).max(20).optional(),
});

export const ExperienceTimelineContentSchema = z.object({
  type: z.literal('EXPERIENCE_TIMELINE'),
  limit: z.number().int().min(1).max(50).optional(),
  types: z.array(z.enum(['WORK', 'EDUCATION'])).optional(), // empty = all
});

// Kerangka schemas (not fully implemented yet)
export const TestimonialsContentSchema = z.object({
  type: z.literal('TESTIMONIALS'),
  limit: z.number().int().min(1).max(20).optional(),
});

export const ArticlesListContentSchema = z.object({
  type: z.literal('ARTICLES_LIST'),
  limit: z.number().int().min(1).max(20).optional(),
  tag: z.string().optional(),
});

export const CustomTextContentSchema = z.object({
  type: z.literal('CUSTOM_TEXT'),
  heading: z.string(),
  body: z.string(),
});

// ─────────────────────────────────────────────
// Discriminated union — the single source of truth
// ─────────────────────────────────────────────

export const SectionContentSchema = z.discriminatedUnion('type', [
  HeroContentSchema,
  SkillsGridContentSchema,
  ProjectsGridContentSchema,
  ExperienceTimelineContentSchema,
  TestimonialsContentSchema,
  ArticlesListContentSchema,
  CustomTextContentSchema,
]);

export type SectionContent = z.infer<typeof SectionContentSchema>;
export type HeroContent = z.infer<typeof HeroContentSchema>;
export type SkillsGridContent = z.infer<typeof SkillsGridContentSchema>;
export type ProjectsGridContent = z.infer<typeof ProjectsGridContentSchema>;
export type ExperienceTimelineContent = z.infer<typeof ExperienceTimelineContentSchema>;

// ─────────────────────────────────────────────
// Default content per type (used in seed script + admin form)
// ─────────────────────────────────────────────

export const DEFAULT_CONTENT: Record<string, object> = {
  HERO: { type: 'HERO', ctaLabel: 'Download Resume', ctaUrl: '' },
  SKILLS_GRID: { type: 'SKILLS_GRID', categories: [] },
  PROJECTS_GRID: { type: 'PROJECTS_GRID', filter: 'featured', limit: 3 },
  EXPERIENCE_TIMELINE: { type: 'EXPERIENCE_TIMELINE', limit: 10, types: [] },
  TESTIMONIALS: { type: 'TESTIMONIALS', limit: 3 },
  ARTICLES_LIST: { type: 'ARTICLES_LIST', limit: 5 },
  CUSTOM_TEXT: { type: 'CUSTOM_TEXT', heading: '', body: '' },
};

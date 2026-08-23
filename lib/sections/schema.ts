import { z } from 'zod';

// ─────────────────────────────────────────────
// Per-type content schemas
// ─────────────────────────────────────────────

export const HeroContentSchema = z.object({
  type: z.literal('HERO'),
  ctaLabel: z.string().optional().or(z.literal('')),      // Legacy fallback
  ctaLabel_id: z.string().optional().or(z.literal('')),   // Indonesian CTA button text
  ctaLabel_en: z.string().optional().or(z.literal('')),   // English CTA button text
  ctaUrl: z.string().url().optional().or(z.literal('')),  // Override CTA URL
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
  heading: z.string().optional().or(z.literal('')),      // Legacy fallback
  heading_id: z.string().optional().or(z.literal('')),   // Indonesian heading
  heading_en: z.string().optional().or(z.literal('')),   // English heading
  body: z.string().optional().or(z.literal('')),         // Legacy fallback
  body_id: z.string().optional().or(z.literal('')),      // Indonesian body
  body_en: z.string().optional().or(z.literal('')),      // English body
});

// ─────────────────────────────────────────────
// Discriminated union — the single source of truth
// ─────────────────────────────────────────────

export const CertificationsContentSchema = z.object({
  type: z.literal('CERTIFICATIONS'),
  limit: z.number().int().min(1).max(12).optional(),
  filter: z.enum(['featured', 'all']).default('featured'),
});

export const SectionContentSchema = z.discriminatedUnion('type', [
  HeroContentSchema,
  SkillsGridContentSchema,
  ProjectsGridContentSchema,
  ExperienceTimelineContentSchema,
  TestimonialsContentSchema,
  ArticlesListContentSchema,
  CustomTextContentSchema,
  CertificationsContentSchema,
]);

export type SectionContent = z.infer<typeof SectionContentSchema>;
export type HeroContent = z.infer<typeof HeroContentSchema>;
export type SkillsGridContent = z.infer<typeof SkillsGridContentSchema>;
export type ProjectsGridContent = z.infer<typeof ProjectsGridContentSchema>;
export type ExperienceTimelineContent = z.infer<typeof ExperienceTimelineContentSchema>;
export type TestimonialsContent = z.infer<typeof TestimonialsContentSchema>;
export type ArticlesListContent = z.infer<typeof ArticlesListContentSchema>;
export type CustomTextContent = z.infer<typeof CustomTextContentSchema>;
export type CertificationsContent = z.infer<typeof CertificationsContentSchema>;

// ─────────────────────────────────────────────
// Default content per type (used in seed script + admin form)
// ─────────────────────────────────────────────

export const DEFAULT_CONTENT: Record<string, object> = {
  HERO: { type: 'HERO', ctaLabel: '', ctaLabel_id: '', ctaLabel_en: '', ctaUrl: '' },
  SKILLS_GRID: { type: 'SKILLS_GRID', categories: [] },
  PROJECTS_GRID: { type: 'PROJECTS_GRID', filter: 'featured', limit: 3 },
  EXPERIENCE_TIMELINE: { type: 'EXPERIENCE_TIMELINE', limit: 10, types: [] },
  TESTIMONIALS: { type: 'TESTIMONIALS', limit: 3 },
  ARTICLES_LIST: { type: 'ARTICLES_LIST', limit: 5 },
  CERTIFICATIONS: { type: 'CERTIFICATIONS', filter: 'featured', limit: 4 },
  CUSTOM_TEXT: { type: 'CUSTOM_TEXT', heading: '', heading_id: '', heading_en: '', body: '', body_id: '', body_en: '' },
};

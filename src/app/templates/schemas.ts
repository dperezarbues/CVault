import { z } from 'zod'

// ── CV JSON ───────────────────────────────────────────────────────────────────

/**
 * Validates a CV JSON object. Permissive — extra top-level fields are allowed for forward
 * compatibility. The only hard requirement is `identity.name`, which every Typst template needs.
 */
export const CvSchema = z
  .object({
    identity: z.object({ name: z.string().min(1, 'identity.name is required') }).passthrough(),
  })
  .passthrough()

export type CvJson = z.infer<typeof CvSchema>

// ── Layout config import ──────────────────────────────────────────────────────

const SerializedSectionSchema = z.union([
  z.object({ id: z.string(), breakable: z.boolean() }).passthrough(),
  z
    .object({
      type: z.literal('columns'),
      columns: z.number(),
      content: z.array(z.array(z.string())),
      breakable: z.boolean(),
    })
    .passthrough(),
])

/**
 * Validates an imported layout config file. The exported file spreads LayoutData fields at the
 * top level; only `header` and `sections` are load-bearing — metadata fields are passed through.
 */
export const LayoutImportSchema = z
  .object({
    header: z.object({ style: z.enum(['split', 'stacked']) }),
    sections: z.array(SerializedSectionSchema),
  })
  .passthrough()

export type LayoutImport = z.infer<typeof LayoutImportSchema>

// ── CV entry (localStorage) ───────────────────────────────────────────────────

export const CvEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
  updatedAt: z.number(),
})

export const CvListSchema = z.array(CvEntrySchema)

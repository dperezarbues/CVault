import { z } from 'zod'

// ── CV JSON ───────────────────────────────────────────────────────────────────
// Permissive: extra top-level fields are allowed (future schema evolution).
// The only hard requirement is identity.name — every Typst template needs it.

export const CvSchema = z
  .object({
    identity: z.object({ name: z.string().min(1, 'identity.name is required') }).passthrough(),
  })
  .passthrough()

export type CvJson = z.infer<typeof CvSchema>

// ── Layout config import ──────────────────────────────────────────────────────
// The exported file spreads LayoutData fields at the top level.
// Validate the two load-bearing fields; ignore metadata (_name, _templateId…).

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

export const LayoutImportSchema = z
  .object({
    header: z.object({ style: z.enum(['split', 'stacked']) }),
    sections: z.array(SerializedSectionSchema),
  })
  .passthrough()

export type LayoutImport = z.infer<typeof LayoutImportSchema>

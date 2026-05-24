export type ContactItem = {
  type: string
  key: string
  value: string
}

export type GenericItem = {
  title: string
  subtitle: string
  period: string
  description: string
  highlights: string // one per line
  tags: string // comma-separated
}

export type SkillGroup = {
  name: string
  entries: string // comma-separated
}

export type CvFormData = {
  identity: {
    name: string
    headline: string
    contact: ContactItem[]
  }
  summary: string
  experience: GenericItem[]
  education: GenericItem[]
  skills: SkillGroup[]
  languages: GenericItem[]
  certifications: GenericItem[]
  side_projects: GenericItem[]
  awards: GenericItem[]
  /** Preserves any top-level fields not handled by the form editor (e.g. core_strengths, leadership). */
  _extra: Record<string, unknown>
}

export const emptyGenericItem = (): GenericItem => ({
  title: '',
  subtitle: '',
  period: '',
  description: '',
  highlights: '',
  tags: '',
})

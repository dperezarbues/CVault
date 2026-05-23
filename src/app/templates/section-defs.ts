export type SectionDef = {
  id: string
  label: string
  locations: ('main' | 'sidebar')[]
}

export const DEFAULT_SECTIONS: SectionDef[] = [
  { id: 'contact',        label: 'Contact',        locations: ['sidebar'] },
  { id: 'summary',        label: 'Summary',        locations: ['main', 'sidebar'] },
  { id: 'experience',     label: 'Experience',     locations: ['main'] },
  { id: 'awards',         label: 'Awards',         locations: ['main', 'sidebar'] },
  { id: 'skills',         label: 'Skills',         locations: ['main', 'sidebar'] },
  { id: 'education',      label: 'Education',      locations: ['main', 'sidebar'] },
  { id: 'languages',      label: 'Languages',      locations: ['main', 'sidebar'] },
  { id: 'certifications', label: 'Certifications', locations: ['main', 'sidebar'] },
  { id: 'side_projects',  label: 'Side Projects',  locations: ['main', 'sidebar'] },
]

'use client'

import { useState } from 'react'
import AccordionSection from '../components/AccordionSection'
import { GenericSection, type ItemFields } from './GenericSection'
import { IdentitySection } from './IdentitySection'
import { SkillsSection } from './SkillsSection'
import type { CvFormData, GenericItem } from './types'

const EXP_FIELDS: ItemFields = {
  title: 'Job title',
  subtitle: 'Company / location',
  period: 'Period',
  highlights: 'Highlights',
  tags: 'Stack',
}
const EDU_FIELDS: ItemFields = {
  title: 'Institution',
  subtitle: 'Degree · field',
  period: 'Period',
  description: 'Notes',
}
const LANG_FIELDS: ItemFields = { title: 'Language', subtitle: 'Level' }
const CERT_FIELDS: ItemFields = { title: 'Certificate', subtitle: 'Issuer · year', tags: 'Tags' }
const PROJ_FIELDS: ItemFields = {
  title: 'Project',
  subtitle: 'Status',
  description: 'Description',
  tags: 'Stack',
}
const AWARD_FIELDS: ItemFields = {
  title: 'Award',
  subtitle: 'Issuer · date',
  description: 'Description',
}

type GenericSectionKey = keyof Pick<
  CvFormData,
  'experience' | 'education' | 'languages' | 'certifications' | 'side_projects' | 'awards'
>

type GenericSectionConfig = {
  id: GenericSectionKey
  label: string
  fields: ItemFields
  addLabel: string
}

const GENERIC_SECTIONS: GenericSectionConfig[] = [
  { id: 'experience', label: 'Experience', fields: EXP_FIELDS, addLabel: 'Add experience' },
  { id: 'education', label: 'Education', fields: EDU_FIELDS, addLabel: 'Add education' },
  { id: 'languages', label: 'Languages', fields: LANG_FIELDS, addLabel: 'Add language' },
  {
    id: 'certifications',
    label: 'Certifications',
    fields: CERT_FIELDS,
    addLabel: 'Add certification',
  },
  { id: 'side_projects', label: 'Side projects', fields: PROJ_FIELDS, addLabel: 'Add project' },
  { id: 'awards', label: 'Awards', fields: AWARD_FIELDS, addLabel: 'Add award' },
]

type Props = {
  data: CvFormData
  onChange: (data: CvFormData) => void
}

export function CvEditor({ data, onChange }: Props) {
  const [open, setOpen] = useState(new Set(['identity', 'summary', 'experience']))

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const sec = (id: string) => ({ isOpen: open.has(id), onToggle: () => toggle(id) })
  const getTitle = (item: GenericItem) => item.title

  return (
    <div>
      <AccordionSection title="Identity" {...sec('identity')}>
        <div className="px-4">
          <IdentitySection
            identity={data.identity}
            onChange={(identity) => onChange({ ...data, identity })}
          />
        </div>
      </AccordionSection>

      <AccordionSection title="Summary" {...sec('summary')}>
        <div className="px-4">
          <textarea
            value={data.summary}
            onChange={(e) => onChange({ ...data, summary: e.target.value })}
            rows={4}
            placeholder="Your professional summary…"
            className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none bg-white"
          />
        </div>
      </AccordionSection>

      <AccordionSection title="Skills" {...sec('skills')}>
        <div className="px-4">
          <SkillsSection
            skills={data.skills}
            onChange={(skills) => onChange({ ...data, skills })}
          />
        </div>
      </AccordionSection>

      {GENERIC_SECTIONS.map(({ id, label, fields, addLabel }) => (
        <AccordionSection key={id} title={label} {...sec(id)}>
          <div className="px-4">
            <GenericSection
              items={data[id]}
              fields={fields}
              addLabel={addLabel}
              getTitle={getTitle}
              onChange={(items) => onChange({ ...data, [id]: items })}
            />
          </div>
        </AccordionSection>
      ))}
    </div>
  )
}

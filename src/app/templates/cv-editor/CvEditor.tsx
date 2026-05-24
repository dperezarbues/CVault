'use client'

import { useState } from 'react'
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

type SectionProps = {
  label: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function Section({ label, isOpen, onToggle, children }: SectionProps) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
      >
        <span>{label}</span>
        <span className="text-gray-400 text-[10px]">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && <div className="px-4 pb-3">{children}</div>}
    </div>
  )
}

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
      <Section label="Identity" {...sec('identity')}>
        <IdentitySection
          identity={data.identity}
          onChange={(identity) => onChange({ ...data, identity })}
        />
      </Section>

      <Section label="Summary" {...sec('summary')}>
        <textarea
          value={data.summary}
          onChange={(e) => onChange({ ...data, summary: e.target.value })}
          rows={4}
          placeholder="Your professional summary…"
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none bg-white"
        />
      </Section>

      <Section label="Experience" {...sec('experience')}>
        <GenericSection
          items={data.experience}
          fields={EXP_FIELDS}
          addLabel="Add experience"
          getTitle={getTitle}
          onChange={(experience) => onChange({ ...data, experience })}
        />
      </Section>

      <Section label="Education" {...sec('education')}>
        <GenericSection
          items={data.education}
          fields={EDU_FIELDS}
          addLabel="Add education"
          getTitle={getTitle}
          onChange={(education) => onChange({ ...data, education })}
        />
      </Section>

      <Section label="Skills" {...sec('skills')}>
        <SkillsSection skills={data.skills} onChange={(skills) => onChange({ ...data, skills })} />
      </Section>

      <Section label="Languages" {...sec('languages')}>
        <GenericSection
          items={data.languages}
          fields={LANG_FIELDS}
          addLabel="Add language"
          getTitle={getTitle}
          onChange={(languages) => onChange({ ...data, languages })}
        />
      </Section>

      <Section label="Certifications" {...sec('certifications')}>
        <GenericSection
          items={data.certifications}
          fields={CERT_FIELDS}
          addLabel="Add certification"
          getTitle={getTitle}
          onChange={(certifications) => onChange({ ...data, certifications })}
        />
      </Section>

      <Section label="Side projects" {...sec('side_projects')}>
        <GenericSection
          items={data.side_projects}
          fields={PROJ_FIELDS}
          addLabel="Add project"
          getTitle={getTitle}
          onChange={(side_projects) => onChange({ ...data, side_projects })}
        />
      </Section>

      <Section label="Awards" {...sec('awards')}>
        <GenericSection
          items={data.awards}
          fields={AWARD_FIELDS}
          addLabel="Add award"
          getTitle={getTitle}
          onChange={(awards) => onChange({ ...data, awards })}
        />
      </Section>
    </div>
  )
}

'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import AccordionSection from '../components/AccordionSection'
import { GenericSection, type ItemFields } from './GenericSection'
import { IdentitySection } from './IdentitySection'
import { SkillsSection } from './SkillsSection'
import type { CvFormData, GenericItem } from './types'

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

type Props = {
  data: CvFormData
  onChange: (data: CvFormData) => void
}

export function CvEditor({ data, onChange }: Props) {
  const t = useTranslations('cvEditor')
  const [open, setOpen] = useState(new Set(['identity', 'summary', 'experience']))

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const sec = (id: string) => ({ isOpen: open.has(id), onToggle: () => toggle(id) })
  const getTitle = (item: GenericItem) => item.title

  const GENERIC_SECTIONS: GenericSectionConfig[] = [
    {
      id: 'experience',
      label: t('experience'),
      fields: {
        title: t('expTitle'),
        subtitle: t('expSubtitle'),
        period: t('expPeriod'),
        highlights: t('expHighlights'),
        tags: t('expTags'),
      },
      addLabel: t('expAdd'),
    },
    {
      id: 'education',
      label: t('education'),
      fields: {
        title: t('eduTitle'),
        subtitle: t('eduSubtitle'),
        period: t('eduPeriod'),
        description: t('eduDescription'),
      },
      addLabel: t('eduAdd'),
    },
    {
      id: 'languages',
      label: t('languages'),
      fields: {
        title: t('langTitle'),
        subtitle: t('langSubtitle'),
      },
      addLabel: t('langAdd'),
    },
    {
      id: 'certifications',
      label: t('certifications'),
      fields: {
        title: t('certTitle'),
        subtitle: t('certSubtitle'),
        tags: t('certTags'),
      },
      addLabel: t('certAdd'),
    },
    {
      id: 'side_projects',
      label: t('sideProjects'),
      fields: {
        title: t('projTitle'),
        subtitle: t('projSubtitle'),
        description: t('projDescription'),
        tags: t('projTags'),
      },
      addLabel: t('projAdd'),
    },
    {
      id: 'awards',
      label: t('awards'),
      fields: {
        title: t('awardTitle'),
        subtitle: t('awardSubtitle'),
        description: t('awardDescription'),
      },
      addLabel: t('awardAdd'),
    },
  ]

  return (
    <div>
      <AccordionSection title={t('identity')} {...sec('identity')}>
        <div className="px-4">
          <IdentitySection
            identity={data.identity}
            onChange={(identity) => onChange({ ...data, identity })}
          />
        </div>
      </AccordionSection>

      <AccordionSection title={t('summary')} {...sec('summary')}>
        <div className="px-4">
          <textarea
            value={data.summary}
            onChange={(e) => onChange({ ...data, summary: e.target.value })}
            rows={4}
            placeholder={t('summaryPlaceholder')}
            className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none bg-white"
          />
        </div>
      </AccordionSection>

      <AccordionSection title={t('skills')} {...sec('skills')}>
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

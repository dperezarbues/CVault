'use client'

import type { SkillGroup } from './types'

type Props = {
  skills: SkillGroup[]
  onChange: (skills: SkillGroup[]) => void
}

export function SkillsSection({ skills, onChange }: Props) {
  const add = () => onChange([...skills, { name: '', entries: '' }])

  const remove = (i: number) => onChange(skills.filter((_, j) => j !== i))

  const set =
    (i: number, k: keyof SkillGroup) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const next = [...skills]
      next[i] = { ...next[i], [k]: e.target.value }
      onChange(next)
    }

  return (
    <div className="space-y-2">
      {skills.map((group, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skill groups identified by position
        <div key={i} className="border border-gray-200 rounded-lg p-2.5 space-y-1.5">
          <div className="flex gap-1.5 items-center">
            <input
              value={group.name}
              onChange={set(i, 'name')}
              placeholder="Category (e.g. Languages & Frameworks)"
              className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
            <button
              type="button"
              aria-label="Remove skill group"
              onClick={() => remove(i)}
              className="text-gray-300 hover:text-red-400 text-sm"
            >
              ×
            </button>
          </div>
          <textarea
            value={group.entries}
            onChange={set(i, 'entries')}
            placeholder="TypeScript, React, Node.js, …"
            rows={2}
            className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none bg-white"
          />
          <p className="text-[10px] text-gray-400">comma-separated</p>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full text-xs border border-dashed border-gray-300 rounded px-2 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
      >
        + Add skill group
      </button>
    </div>
  )
}

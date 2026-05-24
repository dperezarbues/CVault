'use client'

import type { StyleParam, StyleValues } from '../types'
import StyleGroup from './StyleGroup'
import StyleParamField from './StyleParamField'

type Props = {
  styleParams: StyleParam[]
  style: StyleValues
  setStyleValue: (key: string, value: string | number) => void
  resetStyle: () => void
}

export default function StylePanel({ styleParams, style, setStyleValue, resetStyle }: Props) {
  const groupOrder: string[] = []
  const groupMap = new Map<string, StyleParam[]>()
  const ungrouped: StyleParam[] = []

  for (const p of styleParams) {
    if (!p.group) {
      ungrouped.push(p)
      continue
    }
    if (!groupMap.has(p.group)) {
      groupOrder.push(p.group)
      groupMap.set(p.group, [])
    }
    groupMap.get(p.group)?.push(p)
  }

  return (
    <div className="px-4">
      {ungrouped.length > 0 && (
        <div className="space-y-3 pb-3">
          {ungrouped.map((p) => (
            <StyleParamField key={p.key} p={p} value={style[p.key]} onChange={setStyleValue} />
          ))}
        </div>
      )}
      {groupOrder.map((g, i) => (
        <StyleGroup key={g} title={g} defaultOpen={i === 0}>
          {(groupMap.get(g) ?? []).map((p) => (
            <StyleParamField key={p.key} p={p} value={style[p.key]} onChange={setStyleValue} />
          ))}
        </StyleGroup>
      ))}
      <div className="border-t border-gray-100 pt-2 mt-1">
        <button
          type="button"
          onClick={resetStyle}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          ↺ Reset to defaults
        </button>
      </div>
    </div>
  )
}

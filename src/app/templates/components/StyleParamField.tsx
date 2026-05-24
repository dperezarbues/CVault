'use client'

import type { StyleParam } from '../types'

export default function StyleParamField({ p, value, onChange }: {
  p: StyleParam
  value: string | number | undefined
  onChange: (key: string, value: string | number) => void
}) {
  if (p.type === 'color') {
    const v = (value as string) ?? p.default
    return (
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs text-gray-600 flex-1">{p.label}</label>
        <div className="flex items-center gap-1.5">
          <input type="color" value={v} onChange={e => onChange(p.key, e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border border-gray-200 p-0.5 bg-white" />
          <span className="text-xs text-gray-400 font-mono w-16 text-right">{v}</span>
        </div>
      </div>
    )
  }
  if (p.type === 'select') {
    return (
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs text-gray-600 flex-1">{p.label}</label>
        <select value={(value as string) ?? p.default} onChange={e => onChange(p.key, e.target.value)}
          className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-700 bg-white max-w-36">
          {p.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    )
  }
  if (p.type === 'toggle') {
    const checked = ((value as string) ?? p.default) === 'true'
    return (
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs text-gray-600 flex-1">{p.label}</label>
        <button
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(p.key, checked ? 'false' : 'true')}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-200'}`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
        </button>
      </div>
    )
  }
  if (p.type === 'text') {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-600">{p.label}</label>
        <input
          type="text"
          value={(value as string) ?? p.default}
          placeholder={p.placeholder ?? ''}
          onChange={e => onChange(p.key, e.target.value)}
          className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-700 bg-white w-full"
        />
      </div>
    )
  }
  // range
  const v = (value as number) ?? p.default
  const decimals = p.step >= 1 ? 0 : p.step >= 0.1 ? 1 : 2
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-gray-600">{p.label}</label>
        <span className="text-xs text-gray-400 font-mono">{v.toFixed(decimals)}{p.unit}</span>
      </div>
      <input type="range" min={p.min} max={p.max} step={p.step} value={v}
        onChange={e => onChange(p.key, parseFloat(e.target.value))}
        className="w-full accent-blue-500 h-1.5" />
      <div className="flex justify-between text-xs text-gray-300 mt-0.5">
        <span>{p.min}{p.unit}</span><span>{p.max}{p.unit}</span>
      </div>
    </div>
  )
}

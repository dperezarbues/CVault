'use client'

export default function SpacingRow({
  pre,
  post,
  onChange,
  onClear,
}: {
  pre: number
  post: number
  onChange: (pre: number, post: number) => void
  onClear: () => void
}) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
      <span className="shrink-0">↕</span>
      <label className="flex items-center gap-1 shrink-0">
        <span>before</span>
        <input
          type="number"
          min={0.05}
          max={2}
          step={0.05}
          value={pre.toFixed(2)}
          onChange={(e) => onChange(parseFloat(e.target.value) || pre, post)}
          className="w-14 border border-gray-200 rounded px-1 py-0.5 text-xs text-gray-700 bg-white"
        />
        <span>em</span>
      </label>
      <label className="flex items-center gap-1 shrink-0">
        <span>after</span>
        <input
          type="number"
          min={0.05}
          max={2}
          step={0.05}
          value={post.toFixed(2)}
          onChange={(e) => onChange(pre, parseFloat(e.target.value) || post)}
          className="w-14 border border-gray-200 rounded px-1 py-0.5 text-xs text-gray-700 bg-white"
        />
        <span>em</span>
      </label>
      <button
        type="button"
        onClick={onClear}
        className="ml-auto text-gray-300 hover:text-red-400 leading-none"
        title="Reset to template default"
      >
        ×
      </button>
    </div>
  )
}

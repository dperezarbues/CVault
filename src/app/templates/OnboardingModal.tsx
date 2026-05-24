'use client'

const STEPS = [
  {
    step: '1',
    title: 'Add your CV',
    body: 'Use "+ New" to create a CV from the template, or "↑ Import" to load an existing JSON file. You can have multiple CVs and switch between them.',
  },
  {
    step: '2',
    title: 'Pick a template & customise',
    body: 'Select a template from the list. The middle panel lets you reorder sections, toggle page breaks, and adjust colors, fonts, and spacing.',
  },
  {
    step: '3',
    title: 'Generate your PDF',
    body: 'Hit "Generate PDF" in the editor panel. Your CV is compiled with Typst and the PDF appears in the preview. Download whenever you\'re happy.',
  },
] as const

type Props = {
  privateMode: boolean
  onPrivateToggle: (enabled: boolean) => void
  onDismiss: () => void
}

export default function OnboardingModal({ privateMode, onPrivateToggle, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-8 pt-8 pb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Welcome to CVault</h2>
          <p className="text-sm text-gray-500 mb-6">
            A privacy-first CV editor. Your data is stored in this browser — nothing is saved
            server-side.
          </p>

          <div className="space-y-4">
            {STEPS.map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {s.step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">{s.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <input
              type="checkbox"
              id="private-mode-toggle"
              checked={privateMode}
              onChange={(e) => onPrivateToggle(e.target.checked)}
              className="mt-0.5 shrink-0"
            />
            <label
              htmlFor="private-mode-toggle"
              className="text-xs text-gray-600 leading-relaxed cursor-pointer"
            >
              <span className="font-semibold text-gray-800">I&apos;m on a shared computer</span>
              <br />
              Data will be stored in session storage and cleared automatically when this tab closes.
            </label>
          </div>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">You can reopen this via the ? button.</p>
          <button
            type="button"
            onClick={onDismiss}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors font-medium"
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  )
}

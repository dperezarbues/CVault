'use client'

type Props = {
  supportUrl: string
  downloadUrl: string
  onDismiss: () => void
}

export default function SupportPrompt({ supportUrl, downloadUrl, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-80 mx-4">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 leading-none text-lg"
        >
          ×
        </button>

        <p className="text-base font-semibold text-gray-900 mb-1">Enjoying CVault? ☕</p>
        <p className="text-xs text-gray-500 leading-relaxed mb-5">
          It&apos;s free forever. If it saved you time, consider supporting the project — pay what
          you want.
        </p>

        <div className="flex flex-col gap-2">
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onDismiss}
            className="text-sm text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Support the project →
          </a>
          <a
            href={downloadUrl}
            download
            onClick={onDismiss}
            className="text-sm text-center border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Free Download
          </a>
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors pt-1"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}

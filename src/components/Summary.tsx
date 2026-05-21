import cv from '@/data/cv.json'

export default function Summary() {
  const paragraphs = cv.summary.split('\n\n')

  return (
    <section className="mb-8">
      <h2 className="section-title">Profile</h2>
      <div className="space-y-3">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-sm leading-relaxed text-gray-700">
            {para}
          </p>
        ))}
      </div>
    </section>
  )
}

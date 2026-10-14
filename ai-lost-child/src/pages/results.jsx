import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const formatDistance = (value) => {
  if (value === null || value === undefined) return null
  const num = Number(value)
  if (Number.isNaN(num)) return null
  return num.toFixed(4)
}

const formatFaceLabel = (f) => {
  const strict = f?.name_strict
  const ui = f?.name_ui
  const confidence = f?.confidence

  if (strict && strict !== 'Unknown') return strict
  if (ui && ui !== 'Unknown') {
    const suffix = confidence ? ` (${confidence})` : ''
    return `Likely: ${ui}${suffix}`
  }
  return 'Unknown'
}

const ResultsPage = () => {
  const location = useLocation()
  const { results, type } = location.state || {}
  const backendUrl = 'http://localhost:8000'

  // Handle case where user navigates directly without data
  if (!results) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center">
        <h1 className="text-4xl font-semibold text-white">No results to display</h1>
        <p className="max-w-md text-white/65">
          Please go back and upload an image or video to see the detection results.
        </p>
        <Link to="/" className="glow-button bg-aurora text-white shadow-glow">
          Back to Upload
        </Link>
      </div>
    )
  }

  const isImage = type === 'image'
  const imageSrc = results.processed_image_base64
    ? `data:image/png;base64,${results.processed_image_base64}`
    : null
  const rawVideoUrl = results.output_video_url
  const videoUrl = rawVideoUrl
    ? rawVideoUrl.startsWith('http')
      ? rawVideoUrl
      : `${backendUrl}${rawVideoUrl.startsWith('/') ? '' : '/'}${rawVideoUrl}`
    : null
  const faces = Array.isArray(results.faces) ? results.faces : []

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16">
      <header className="space-y-4">
        <Link to="/" className="text-mint hover:underline">
          &larr; Upload another file
        </Link>
        <h1 className="text-4xl font-semibold text-white">Detection Results</h1>
        <p className="max-w-2xl text-white/65">
          The media below has been processed by the FaceNet + MTCNN pipeline. Bounding boxes and identity labels have
          been drawn on detected faces.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Media Display */}
        <motion.div
          className="card-surface overflow-hidden rounded-3xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isImage ? (
            imageSrc ? (
              <img src={imageSrc} alt="Face recognition result" className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center p-10 text-center text-white/60">
                No processed image returned.
              </div>
            )
          ) : (
            videoUrl ? (
              <video src={videoUrl} controls autoPlay loop className="h-full w-full" />
            ) : (
              <div className="flex h-full items-center justify-center p-10 text-center text-white/60">
                No processed video URL returned.
              </div>
            )
          )}
        </motion.div>

        {/* Metadata Display */}
        <motion.div
          className="card-surface flex h-full flex-col p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-white">Recognition Results</h2>
          <p className="mb-4 text-white/60">Detected faces and matching distances.</p>

          {isImage ? (
            <div className="space-y-4">
              {faces.length === 0 ? (
                <p className="text-white/60">No faces detected.</p>
              ) : (
                <div className="grid gap-3">
                  {faces.map((f, idx) => (
                    <div key={`${f.name_ui || f.name_strict || 'face'}-${idx}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-base font-semibold text-white">{formatFaceLabel(f)}</p>
                        <p className="text-sm text-mint">Score {formatDistance(f.score) ?? '—'}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
                        <span>Second {formatDistance(f.second_score) ?? '—'}</span>
                        <span>Confidence {f.confidence || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-auto rounded-xl bg-black/30 p-4">
              <pre className="text-sm text-white/80">
                <code>{JSON.stringify(results.meta || results, null, 2)}</code>
              </pre>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ResultsPage


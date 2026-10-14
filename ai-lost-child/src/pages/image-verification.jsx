import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

const backendUrl = 'http://localhost:8000'

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

const ImageVerificationPage = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const faces = useMemo(() => results?.faces || [], [results])

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setResults(null)
    setError(null)
  }

  const handleVerify = async () => {
    if (!selectedFile) {
      setError('Please select an image first.')
      return
    }

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file.')
      return
    }

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch(`${backendUrl}/api/detect/image-face`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.detail || data?.message || 'Image face detection failed.')
      }

      if (!data?.success) {
        throw new Error(data?.message || 'Image face detection failed.')
      }

      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16">
      <header className="space-y-4">
        <span className="accent-pill bg-mint/20 text-mint">Image Verification</span>
        <h1 className="text-4xl font-semibold text-white">Image-Based Child Identity Verification</h1>
        <p className="max-w-3xl text-white/65">
          Upload a single image to detect multiple faces and recognize them using the FaceNet + MTCNN pipeline.
        </p>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          Results include green bounding boxes, identity labels, and cosine similarity scores.
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <motion.section
          className="card-surface flex flex-col gap-6 p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Upload image</h2>
            <p className="text-white/60">Choose a clear photo for best FaceNet verification.</p>
          </div>

          <label className="flex cursor-pointer flex-col items-center gap-4 rounded-3xl border border-dashed border-white/20 bg-white/5 px-6 py-10 text-center transition hover:border-mint/50 hover:bg-white/10">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            <div className="rounded-full bg-mint/20 px-4 py-1 text-xs font-semibold text-mint">Click to upload</div>
            <p className="text-white/70">PNG, JPG, JPEG supported</p>
            <p className="text-sm text-white/40">{selectedFile ? selectedFile.name : 'No file selected yet'}</p>
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="glow-button bg-aurora text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleVerify}
              disabled={isLoading || !selectedFile}
            >
              {isLoading ? 'Detecting...' : 'Detect Faces'}
            </button>
            <button
              type="button"
              className="glow-button border border-white/20 bg-transparent text-white/80"
              onClick={() => {
                setSelectedFile(null)
                setPreviewUrl(null)
                setResults(null)
                setError(null)
              }}
              disabled={isLoading}
            >
              Reset
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {previewUrl && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-white/80">Preview</p>
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                <img src={previewUrl} alt="Uploaded preview" className="w-full object-contain" />
              </div>
            </div>
          )}
        </motion.section>

        <motion.section
          className="card-surface flex flex-col gap-6 p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Result</h2>
            <p className="text-white/60">Processed image with green face boxes and labels.</p>
          </div>

          {results ? (
            <div className="space-y-6">
              {results.processed_image_base64 && (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                  <img
                    src={`data:image/png;base64,${results.processed_image_base64}`}
                    alt="Processed output"
                    className="w-full object-contain"
                  />
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Detected faces</h3>

                {faces.length === 0 ? (
                  <p className="text-white/60">No faces detected.</p>
                ) : (
                  <div className="grid gap-3">
                    {faces.map((f, idx) => (
                      <div
                        key={`${f.name_ui || f.name_strict || 'face'}-${idx}`}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-base font-semibold text-white">{formatFaceLabel(f)}</p>
                          <p className="text-sm text-mint">Score {formatDistance(f.score) ?? '—'}</p>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
                          <span>Second {formatDistance(f.second_score) ?? '—'}</span>
                          <span>Confidence {f.confidence || '—'}</span>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm text-white/70">
                          <div className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2">
                            <span>Bounding box</span>
                            <span className="text-white">
                              {Array.isArray(f.bbox) ? `[${f.bbox.join(', ')}]` : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
              <p className="text-white/60">Upload and verify an image to see results here.</p>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  )
}

export default ImageVerificationPage

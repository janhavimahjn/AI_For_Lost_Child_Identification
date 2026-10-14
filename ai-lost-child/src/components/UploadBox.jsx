import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const UploadBox = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileName, setFileName] = useState('No file selected yet')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFileName(file.name)
      setError(null) // Clear previous errors on new file selection
    }
  }

  const handleDetect = async () => {
    if (!selectedFile) {
      setError('Please select a file first.')
      return
    }

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    const isImage = selectedFile.type.startsWith('image/')
    const endpoint = isImage ? '/api/detect/image-face' : '/api/detect/video-face'
    const backendUrl = 'http://localhost:8000'

    try {
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        body: formData,
      })

      const results = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(results?.detail || results?.error || 'Something went wrong with the detection.')
      }

      if (isImage && results && results.success === false) {
        throw new Error(results.error || 'Image detection failed.')
      }

      // Navigate to results page with the data
      navigate('/results', { state: { results, type: isImage ? 'image' : 'video' } })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="card-surface flex flex-col gap-6 p-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">Upload footage</h3>
        <p className="text-white/65">Drop in a video or image to run detection.</p>
      </div>
      <label className="flex cursor-pointer flex-col items-center gap-4 rounded-3xl border border-dashed border-white/20 bg-white/5 px-6 py-12 text-center transition hover:border-mint/50 hover:bg-white/10">
        <input type="file" className="hidden" accept="video/*,image/*" onChange={handleFileChange} />
        <div className="rounded-full bg-mint/20 px-4 py-1 text-xs font-semibold text-mint">Drag & Drop</div>
        <p className="text-white/70">or click to browse files</p>
        <p className="text-sm text-white/40">{fileName}</p>
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}
      
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="glow-button bg-aurora text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleDetect}
          disabled={isLoading || !selectedFile}
        >
          {isLoading ? 'Processing...' : 'Start Detection'}
        </button>
        <button type="button" className="glow-button border border-white/20 bg-transparent text-white/80">
          Use sample video
        </button>
      </div>
    </motion.div>
  )
}

export default UploadBox


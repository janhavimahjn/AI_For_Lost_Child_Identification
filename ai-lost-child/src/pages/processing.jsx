import { motion } from 'framer-motion'
import UploadBox from '../components/UploadBox'
import scannerIllustration from '../assets/illustrations/scanner-illustration.svg'

const ProcessingPage = () => (
  <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16">
    <div className="space-y-4">
      <span className="accent-pill bg-white/10 text-white/70">Processing</span>
      <h1 className="text-4xl font-semibold text-white">Run detection</h1>
      <p className="max-w-2xl text-white/65">
        Upload a clip or image to run face recognition. This demo uses MTCNN for detection and FaceNet embeddings for
        matching.
      </p>
    </div>

    <div className="grid gap-8 md:grid-cols-2">
      <UploadBox />
      <motion.div
        className="card-surface flex flex-col gap-5 p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-white">Preview window</p>
          <span className="rounded-full bg-mint/20 px-3 py-1 text-xs font-semibold text-mint">Live</span>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/50">
          <img src={scannerIllustration} alt="Preview" className="w-full opacity-90" />
          <motion.div
            className="absolute left-6 top-6 rounded-full border border-mint px-4 py-1 text-xs font-semibold text-mint"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Processing...
          </motion.div>
          <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-black/70 px-4 py-3 text-sm text-white/80">
            Bounding boxes will pop here with confidence scores and playful glow pulses.
          </div>
        </div>
        <div className="grid gap-3 text-sm text-white/60">
          <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
            <p>Face detection</p>
            <p className="text-mint">Running</p>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
            <p>Embedding extraction</p>
            <p className="text-white/40">Waiting</p>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
            <p>Face matching</p>
            <p className="text-white/40">Waiting</p>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
)

export default ProcessingPage


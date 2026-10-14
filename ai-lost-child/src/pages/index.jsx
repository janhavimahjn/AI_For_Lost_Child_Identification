import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import Card from '../components/Card'
import heroIllustration from '../assets/illustrations/hero-illustration.svg'
import scannerIllustration from '../assets/illustrations/scanner-illustration.svg'

const featureCards = [
  {
    title: 'Face Detection',
    description: 'Detect faces inside images or CCTV frames with MTCNN and draw clean bounding boxes.',
    icon: '🧠',
    tag: 'Vision',
    footer: 'Find faces in a crowd — instantly.',
  },
  {
    title: 'Face Recognition',
    description: 'FaceNet embeddings match lost kids with registered faces using a reference embedding database.',
    icon: '🎯',
    tag: 'Biometrics',
    footer: 'Face detection + FaceNet = Reliable Identification.',
  },
  {
    title: 'Real-Time Analysis',
    description: 'Responsive UI shows bounding boxes, scores, and alerts in less than a blink.',
    icon: '⚡',
    tag: 'Realtime',
    footer: 'Built for learning, built for the future.',
  },
]

const HomePage = () => (
  <div className="space-y-20 pb-20 pt-6">
    <Hero
      title="AI-Based Lost Child Detection System"
      subtitle="Smart AI. Real Impact. A playful dashboard that shows how MTCNN and FaceNet team up to recognize lost kids across crowded spaces."
      illustration={heroIllustration}
    />

    <section className="mx-auto max-w-6xl px-4">
      <div className="mb-10 flex flex-col gap-4">
        <span className="accent-pill bg-white/10 text-white/70">Features</span>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            Tech that feels alive, yet stays lightweight.
          </h2>
          <p className="text-white/60 md:max-w-sm">
            Smooth micro interactions built with Framer Motion keep the journey bright and Gen-Z friendly.
          </p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {featureCards.map((card) => (
          <Card key={card.title} {...card} />
        ))}
      </div>
    </section>

    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
      <motion.div
        className="card-surface p-6"
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <img src={scannerIllustration} alt="Scanner illustration" className="w-full rounded-3xl" />
      </motion.div>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <span className="accent-pill bg-mint/20 text-mint">Pipeline</span>
        <h3 className="text-3xl font-semibold text-white">From CCTV to meaningful alerts.</h3>
        <ul className="space-y-4 text-white/70">
          <li>
            <strong className="text-white">1. Capture:</strong> ingest frames or uploads from the processing page.
          </li>
          <li>
            <strong className="text-white">2. Detect:</strong> MTCNN finds faces and draws bounding boxes.
          </li>
          <li>
            <strong className="text-white">3. Recognize:</strong> FaceNet checks embeddings vs. the missing-child gallery.
          </li>
          <li>
            <strong className="text-white">4. Notify:</strong> Minimal alerts pulse with neon glows for quick action.
          </li>
        </ul>
      </motion.div>
    </section>

    <section className="mx-auto max-w-6xl px-4">
      <div className="card-surface flex flex-col gap-6 rounded-3xl px-8 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="accent-pill mb-4 bg-white/10 text-white/70">Ready</p>
          <h3 className="text-3xl font-semibold text-white">
            Built by students, for students. No enterprise fluff — just pure Gen-Z energy.
          </h3>
        </div>
        <div className="flex flex-col gap-3 md:w-1/3">
          <Link className="glow-button bg-aurora text-center text-white shadow-glow" to="/processing">
            Run Detection
          </Link>
          <Link className="glow-button text-center text-white/80" to="/blog">
            See how it works →
          </Link>
        </div>
      </div>
    </section>
  </div>
)

export default HomePage


import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const heroVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
}

const Hero = ({ title, subtitle, illustration }) => (
  <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
    <motion.div
      className="flex flex-col gap-8"
      initial="hidden"
      animate="show"
      variants={heroVariants}
      transition={{ duration: 0.6 }}
    >
      <span className="accent-pill w-fit bg-white/10 text-white/80">AI + Vision + Safety</span>
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold leading-tight text-white md:text-5xl">{title}</h1>
        <p className="text-lg text-white/70 md:text-xl">{subtitle}</p>
        <p className="text-sm uppercase tracking-[0.4em] text-white/40">MTCNN · FaceNet</p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link to="/processing" className="glow-button bg-aurora text-white shadow-glow">
          Try Demo
        </Link>
        <Link
          to="/about"
          className="glow-button border border-white/20 bg-transparent text-white hover:bg-white/10"
        >
          Learn More
        </Link>
      </div>
      <div className="flex flex-wrap gap-8 text-sm text-white/60">
        <div>
          <p className="text-3xl font-semibold text-white">98%</p>
          <p>Matching Accuracy*</p>
        </div>
        <div>
          <p className="text-3xl font-semibold text-white">0.4s</p>
          <p>Per-frame Analysis</p>
        </div>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="card-surface relative overflow-hidden rounded-3xl p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
      <motion.img
        src={illustration}
        alt="Vision system illustration"
        className="relative z-10 w-full"
        whileHover={{ rotate: 2, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 120 }}
      />
      <div className="relative z-10 mt-6 grid gap-3 text-sm text-white/70">
        <p>“Find faces in a crowd — instantly.”</p>
        <p>“Built for learning, built for the future.”</p>
      </div>
    </motion.div>
  </section>
)

export default Hero


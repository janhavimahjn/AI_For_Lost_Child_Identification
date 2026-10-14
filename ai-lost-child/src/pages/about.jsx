import { motion } from 'framer-motion'
import heroIllustration from '../assets/illustrations/hero-illustration.svg'

const team = [
  { name: 'Ari', role: 'Vision Engineer', blurb: 'MTCNN tuning + dataset prep' },
  { name: 'Mika', role: 'AI Researcher', blurb: 'FaceNet embeddings + metrics' },
]

const AboutPage = () => (
  <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-16">
    <header className="space-y-4 text-center">
      <span className="accent-pill bg-white/10 text-white/70">About</span>
      <h1 className="text-4xl font-semibold text-white">Why we built this</h1>
      <p className="mx-auto max-w-2xl text-white/65">
        Student-friendly project showing how modern computer vision can help re-unite lost kids with
        their families. Creative, simple, hopeful.
      </p>
    </header>

    <motion.section
      className="card-surface grid gap-10 rounded-3xl p-8 md:grid-cols-2"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold text-white">Motivation</h2>
        <p className="text-white/70">
          Cities are busy, yet safety tech can still feel outdated. We imagined a playful dashboard that
          any campus team could demo — low lift, high clarity, with neon gradients that scream
          creativity over corporate.
        </p>
        <ul className="space-y-3 text-white/65">
          <li>• Soft pastel cards make reviewing alerts feel calm.</li>
          <li>• FaceNet keeps recognition fast and ethical.</li>
          <li>• Tailwind tokens make theme tweaks super easy.</li>
        </ul>
      </div>
      <img src={heroIllustration} alt="About graphic" className="w-full rounded-3xl" />
    </motion.section>

    <section className="grid gap-6 md:grid-cols-2">
      {team.map((member) => (
        <div key={member.name} className="card-surface rounded-3xl p-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-2xl">
            {member.name.slice(0, 1)}
          </div>
          <h3 className="text-2xl font-semibold text-white">{member.name}</h3>
          <p className="text-mint">{member.role}</p>
          <p className="mt-2 text-white/65">{member.blurb}</p>
        </div>
      ))}
    </section>

    <motion.section
      className="card-surface rounded-3xl p-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="mb-6 text-3xl font-semibold text-white">Contact us</h2>
      <form className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/70">Name</label>
          <input
            type="text"
            placeholder="Your name"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-mint/50 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/70">Email</label>
          <input
            type="email"
            placeholder="you@email.com"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-mint/50 focus:outline-none"
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm text-white/70">Message</label>
          <textarea
            rows="4"
            placeholder="Tell us about your idea..."
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-mint/50 focus:outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <button type="button" className="glow-button bg-aurora text-white shadow-glow">
            Send Message
          </button>
        </div>
      </form>
    </motion.section>
  </div>
)

export default AboutPage


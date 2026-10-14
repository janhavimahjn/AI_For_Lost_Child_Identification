import { motion } from 'framer-motion'

const Card = ({ icon, title, description, tag, footer }) => (
  <motion.div
    className="card-surface flex h-full flex-col gap-4 p-6"
    whileHover={{ y: -6, scale: 1.01 }}
    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
  >
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl">
        {icon}
      </div>
      {tag && <span className="accent-pill bg-white/5 text-white/70">{tag}</span>}
    </div>
    <div className="space-y-3">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-white/70">{description}</p>
    </div>
    {footer && <p className="mt-auto text-sm text-mint">{footer}</p>}
  </motion.div>
)

export default Card


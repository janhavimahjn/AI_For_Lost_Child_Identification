import { motion } from 'framer-motion'

const BlogCard = ({ title, description, image, tag }) => (
  <motion.article
    whileHover={{ y: -8 }}
    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
    className="card-surface overflow-hidden rounded-3xl"
  >
    <div className="relative h-48 w-full overflow-hidden">
      <img src={image} alt={title} className="h-full w-full object-cover" />
      <span className="accent-pill absolute left-4 top-4 bg-black/70 text-white/80">{tag}</span>
    </div>
    <div className="space-y-4 p-6">
      <h3 className="text-2xl font-semibold text-white">{title}</h3>
      <p className="text-white/70">{description}</p>
      <button className="glow-button bg-transparent text-mint hover:text-white">
        Read More →
      </button>
    </div>
  </motion.article>
)

export default BlogCard


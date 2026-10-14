import { useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Processing', to: '/processing' },
  { label: 'Image Verification', to: '/image-verification' },
  { label: 'Results', to: '/results' },
  { label: 'Blog', to: '/blog' },
  { label: 'About', to: '/about' },
]

const activeClasses = 'text-white'
const baseClasses =
  'text-sm font-medium tracking-wide text-white/70 hover:text-white transition-colors'

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-night/60 border-b border-white/5">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-aurora text-white shadow-glow">
            <span className="text-lg font-semibold">AI</span>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">Project</p>
            <p className="text-lg font-semibold text-white">Lost Child Detection</p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:block">
          <Link to="/processing" className="glow-button inline-flex items-center gap-2">
            <span>Try Demo</span>
            <span className="text-mint">→</span>
          </Link>
        </div>

        <button
          type="button"
          className="glow-button flex items-center gap-2 px-4 py-2 text-sm md:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          Menu
          <span className="text-lg">{open ? '—' : '≡'}</span>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="border-t border-white/10 bg-night/80 px-4 pb-6 pt-3 text-white md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`text-base font-medium tracking-wide ${
                    location.pathname === link.to ? 'text-white' : 'text-white/70'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/processing"
                onClick={() => setOpen(false)}
                className="rounded-2xl bg-aurora px-4 py-3 text-center text-sm font-semibold text-white shadow-glow"
              >
                Run Detection
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar


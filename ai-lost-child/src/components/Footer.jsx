import { Link } from 'react-router-dom'

const Footer = () => (
  <footer className="border-t border-white/10 bg-black/50">
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-white">AI-Based Lost Child Detection System</p>
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Smart AI. Real Impact.</p>
      </div>
      <div className="flex flex-wrap gap-6">
        <Link to="/processing" className="hover:text-white">
          Run Detection
        </Link>
        <Link to="/results" className="hover:text-white">
          Sample Results
        </Link>
        <Link to="/blog" className="hover:text-white">
          Learn
        </Link>
        <Link to="/about" className="hover:text-white">
          Team
        </Link>
      </div>
      <p className="text-xs text-white/50">© {new Date().getFullYear()} Student-built for the future.</p>
    </div>
  </footer>
)

export default Footer


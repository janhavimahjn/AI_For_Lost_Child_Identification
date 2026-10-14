import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/index'
import ProcessingPage from './pages/processing'
import ResultsPage from './pages/results'
import BlogPage from './pages/blog'
import AboutPage from './pages/about'
import ImageVerificationPage from './pages/image-verification'

const PageWrapper = ({ children }) => (
  <motion.main
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.45, ease: 'easeOut' }}
    className="relative z-10"
  >
    {children}
  </motion.main>
)

const ScrollToTop = () => {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])
  return null
}

function App() {
  const location = useLocation()

  return (
    <div className="relative min-h-screen text-white">
      <ScrollToTop />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-1/4 left-1/3 h-96 w-96 rounded-full bg-lavender/30 blur-3xl" />
        <div className="absolute top-1/4 right-0 h-[28rem] w-[28rem] rounded-full bg-mint/20 blur-[140px]" />
        <div className="absolute bottom-0 left-16 h-72 w-72 rounded-full bg-[#1c1c28] blur-3xl opacity-70" />
      </div>

      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageWrapper>
                <HomePage />
              </PageWrapper>
            }
          />
          <Route
            path="/processing"
            element={
              <PageWrapper>
                <ProcessingPage />
              </PageWrapper>
            }
          />
          <Route
            path="/results"
            element={
              <PageWrapper>
                <ResultsPage />
              </PageWrapper>
            }
          />
          <Route
            path="/blog"
            element={
              <PageWrapper>
                <BlogPage />
              </PageWrapper>
            }
          />
          <Route
            path="/about"
            element={
              <PageWrapper>
                <AboutPage />
              </PageWrapper>
            }
          />
          <Route
            path="/image-verification"
            element={
              <PageWrapper>
                <ImageVerificationPage />
              </PageWrapper>
            }
          />
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  )
}

export default App

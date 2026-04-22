import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

function useIsPortraitMobile() {
  const check = () =>
    typeof window !== 'undefined' &&
    window.innerWidth < 640 &&
    window.innerWidth < window.innerHeight

  const [active, setActive] = useState(check)

  useEffect(() => {
    const update = () => setActive(check())
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return active
}

const PhoneRotateIllustration = () => (
  <div className="relative flex items-center justify-center w-24 h-24 mx-auto">
    {/* Phone in portrait */}
    <svg width="36" height="60" viewBox="0 0 36 60" fill="none" className="text-indigo-400/60">
      <rect x="1" y="1" width="34" height="58" rx="5" stroke="currentColor" strokeWidth="2"/>
      <rect x="13" y="52" width="10" height="4" rx="2" fill="currentColor" opacity="0.5"/>
      <rect x="11" y="5" width="14" height="2" rx="1" fill="currentColor" opacity="0.4"/>
    </svg>

    {/* Rotation arrow */}
    <svg
      width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className="absolute -right-1 -top-1 text-indigo-400/80"
    >
      <path d="M21 2v6h-6"/>
      <path d="M21 8A10 10 0 1 1 12 2"/>
    </svg>
  </div>
)

export function MobileGuidanceScreen() {
  const isPortraitMobile = useIsPortraitMobile()
  const [dismissed, setDismissed] = useState(false)
  const [copied, setCopied] = useState(false)

  // Auto-undismiss when returning to landscape so the overlay reappears if needed
  useEffect(() => {
    if (!isPortraitMobile) setDismissed(false)
  }, [isPortraitMobile])

  if (!isPortraitMobile || dismissed) return null

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // clipboard not available, silently ignore
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center
        bg-gray-950 px-7 py-12 text-white"
    >
      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3 }}
        className="flex items-center gap-2.5 mb-10"
      >
        <img
          src="/flowhr-navbar.png"
          alt="FlowHR"
          className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
        />
        <span className="text-xl font-bold text-white tracking-tight">FlowHR</span>
      </motion.div>

      {/* Illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <PhoneRotateIllustration />
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.3 }}
        className="mt-7 text-center"
      >
        <h1 className="text-[19px] font-bold text-white tracking-tight mb-2.5 leading-snug">
          Built for desktop
        </h1>
        <p className="text-[13.5px] text-gray-400 leading-relaxed max-w-[270px] mx-auto">
          FlowHR is a professional workflow designer optimized for larger screens. Rotate your device to landscape or open on a desktop for the full experience.
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.3 }}
        className="mt-9 flex flex-col gap-3 w-full max-w-[270px]"
      >
        {/* Tip about rotating */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
          <span className="text-[12px] font-medium">Rotate to landscape to continue</span>
        </div>

        {/* Continue Anyway */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="
            w-full py-3 rounded-xl text-[13px] font-semibold
            bg-white/8 border border-white/12 text-gray-300
            hover:bg-white/12 hover:text-white hover:border-white/20
            active:bg-white/6 transition-all duration-150
          "
        >
          Continue Anyway
        </button>

        {/* Copy Link */}
        <button
          type="button"
          onClick={() => void copyLink()}
          className="
            w-full py-2.5 rounded-xl text-[12.5px] font-medium
            text-gray-500 hover:text-gray-300
            border border-transparent hover:border-white/8
            transition-all duration-150
          "
        >
          {copied ? 'Link copied to clipboard' : 'Copy link to open later'}
        </button>
      </motion.div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.3 }}
        className="mt-10 text-[10.5px] text-gray-700 text-center leading-relaxed"
      >
        Workflow state is saved locally and will be waiting when you return on desktop.
      </motion.p>
    </motion.div>
  )
}

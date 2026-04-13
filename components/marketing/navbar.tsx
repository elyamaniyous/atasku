'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { AtaskuLogo } from './logo'

const navLinks = [
  { label: 'Fonctionnalites', href: '/#fonctionnalites' },
  { label: 'Modules', href: '/#modules' },
  { label: 'IA', href: '/#ia' },
  { label: 'Tarifs', href: '/#tarifs' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(0,0,0,0.05)]'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/home" className="flex items-center">
            <AtaskuLogo size="small" className={scrolled ? 'text-stone-900' : 'text-stone-900'} />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-red-600 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-stone-600 transition-all hover:text-stone-900"
            >
              Se connecter
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20 active:scale-[0.98]"
            >
              Essai gratuit
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden rounded-lg p-2 text-stone-600 hover:text-stone-900"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl md:hidden"
          >
            <div className="flex h-16 items-center justify-between px-4 border-b border-stone-100">
              <AtaskuLogo size="small" />
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-stone-400 hover:text-stone-900">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                >
                  {link.label}
                </a>
              ))}
              <div className="my-3 border-t border-stone-100" />
              <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-xl border border-stone-200 px-3 py-2.5 text-center text-sm font-medium text-stone-600 hover:border-stone-300">
                Se connecter
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)} className="rounded-xl bg-red-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-red-700 mt-2">
                Essai gratuit
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '.' : d + '.')
    }, 400)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          router.replace('/dashboard')
        } else {
          router.replace('/login')
        }
      } catch {
        router.replace('/login')
      }
    }
    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#080c14] relative overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-600/6 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Card */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-lg opacity-40 scale-110" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <h1 className="font-black text-2xl text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              LeadPanel
            </h1>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-400/70 mt-0.5">
              CompTIA Manager
            </p>
          </div>
        </div>

        {/* Spinner */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-[2.5px] border-indigo-500/15" />
            <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-indigo-500 animate-spin" />
          </div>
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            Verifying session{dots}
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <p className="text-[11px] text-slate-700 font-medium">
          © {new Date().getFullYear()} LeadPanel · All rights reserved
        </p>
      </div>
    </div>
  )
}
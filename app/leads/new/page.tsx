'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import LeadForm from '@/components/LeadForm'
import { Lead } from '@/types'

type LeadFormData = Omit<Lead, 'id' | 'createdAt'>

export default function NewLeadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        })

        if (!res.ok) {
          router.replace('/login')
          return
        }

        const data = await res.json()
        if (!data?.user) {
          router.replace('/login')
          return
        }

        setChecking(false)
      } catch {
        router.replace('/login')
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (formData: LeadFormData) => {
    setLoading(true)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.message || 'Failed to create lead')
      }

      // created() returns { success, data: { lead } } — no need to read it,
      // we just redirect on success
      router.push('/leads')
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Error creating lead')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8 fade-up">
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Add New Lead
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Fill in the details to create a new lead
          </p>
        </div>

        <LeadForm onSubmit={handleSubmit} isLoading={loading} />
      </main>
    </div>
  )
}
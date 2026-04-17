'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import LeadForm from '@/components/LeadForm'
import { Lead } from '@/types'

type LeadFormData = Omit<Lead, 'id' | 'createdAt'>

export default function EditLeadPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const authRes = await fetch('/api/auth/me', {
          credentials: 'include',
        })

        if (!authRes.ok) {
          router.replace('/login')
          return
        }

        const authData = await authRes.json()
        if (!authData?.user) {
          router.replace('/login')
          return
        }

        const leadRes = await fetch(`/api/leads/${id}`, {
          credentials: 'include',
        })

        if (!leadRes.ok) {
          router.replace('/leads')
          return
        }

        const data = await leadRes.json()

        // ok() wraps payload in data: { success, data: { lead } }
        setLead(data.data.lead)
        setChecking(false)
      } catch {
        router.replace('/login')
      }
    }

    if (id) load()
  }, [id, router])

  const handleSubmit = async (formData: LeadFormData) => {
    setLoading(true)

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to update lead')

      router.push('/leads')
    } catch (err) {
      console.error(err)
      alert('Error updating lead')
    } finally {
      setLoading(false)
    }
  }

  if (checking || !lead) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </main>
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
            Edit Lead
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">{lead.email}</p>
        </div>

        <LeadForm
          initialData={lead}
          onSubmit={handleSubmit}
          isLoading={loading}
          isEdit
        />
      </main>
    </div>
  )
}
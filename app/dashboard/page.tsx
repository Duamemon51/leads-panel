'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { Lead } from '@/types'

const statusColors: Record<string, string> = {
  New: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Contacted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Qualified: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Closed Won': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Closed Lost': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Follow Up': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()

  const [leads, setLeads] = useState<Lead[]>([])
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // ✅ AUTH + LEADS (FIXED)
  useEffect(() => {
    const load = async () => {
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

        setUser(data.user)

        // ✅ FIX: fetch leads from API (not store.ts)
        const leadRes = await fetch('/api/leads', {
          credentials: 'include',
        })

        const leadData = await leadRes.json()

        setLeads(leadData.leads || [])
        setLoading(false)
      } catch (err) {
        router.replace('/login')
      }
    }

    load()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  const todayLeads = leads.filter(l => {
    const d = new Date(l.createdAt)
    return d.toDateString() === new Date().toDateString()
  })

  const statusCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1
    return acc
  }, {})

  const paidLeads = leads.filter(l => l.payment === 'Paid').length
  const recentLeads = leads.slice(0, 6)

  const stats = [
    { label: 'Total Leads', value: leads.length, icon: '👥', color: 'from-indigo-600 to-indigo-400' },
    { label: 'Added Today', value: todayLeads.length, icon: '📅', color: 'from-emerald-600 to-emerald-400' },
    { label: 'Paid', value: paidLeads, icon: '💳', color: 'from-violet-600 to-violet-400' },
    { label: 'Closed Won', value: statusCounts['Closed Won'] || 0, icon: '🏆', color: 'from-amber-600 to-amber-400' },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 text-sm">
              Welcome back {user?.name}
            </p>
          </div>

          <Link
            href="/leads/new"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm"
          >
            + Add Lead
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5"
            >
              <div className="flex justify-between mb-3">
                <span className="text-xl">{s.icon}</span>
              </div>
              <p className="text-2xl text-white font-bold">{s.value}</p>
              <p className="text-slate-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* RECENT LEADS */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Recent Leads</h2>

          {recentLeads.length === 0 ? (
            <p className="text-slate-400">No leads found</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map(lead => (
                <Link
                  key={lead.id}
                  href={`/leads/edit/${lead.id}`}
                  className="flex justify-between p-3 rounded-lg hover:bg-slate-700/40"
                >
                  <div>
                    <p className="text-white">{lead.email}</p>
                    <p className="text-xs text-slate-400">
                      {lead.exam} • {lead.country}
                    </p>
                  </div>

                  <span className="text-xs text-slate-300">
                    {lead.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
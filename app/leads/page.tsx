'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import Sidebar from '@/components/Sidebar'
import LeadForm from '@/components/LeadForm'
import { Lead } from '@/types'

const statusColors: Record<string, { bg: string, text: string, border: string, dot: string }> = {
  New: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  Contacted: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  Qualified: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', dot: 'bg-purple-400' },
  'Closed Won': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  'Closed Lost': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-400' },
  'Follow Up': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', dot: 'bg-orange-400' },
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      const res = await fetch(`/api/leads?${params.toString()}`, { credentials: 'include' })
      const data = await res.json()
      setLeads(data.data.leads ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLeads() }, [search, status])

  const handleCreateLead = async (formData: any) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      })
      if (res.ok) {
        setShowAddModal(false)
        fetchLeads()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/leads/${id}`, { method: 'DELETE', credentials: 'include' })
    setLeads(prev => prev.filter(l => l.id !== id))
    setConfirmDelete(null)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#05070a] text-slate-300">
      <Sidebar />

      <main className="flex-1 p-8 lg:p-12 overflow-auto relative">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] -z-10 pointer-events-none" />

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
              Leads <span className="text-indigo-500">Overview</span>
            </h1>
            <p className="text-slate-500 font-medium">Manage and track your potential candidates effortlessly.</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="group relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Add New Lead
          </button>
        </div>

        {/* STATS SUMMARY (EYE-CANDY) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900/40 border border-slate-800/50 p-5 rounded-3xl backdrop-blur-md">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Leads</p>
                <h2 className="text-2xl font-bold text-white">{leads.length}</h2>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/50 p-5 rounded-3xl backdrop-blur-md">
                <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">New</p>
                <h2 className="text-2xl font-bold text-white">{leads.filter(l => l.status === 'New').length}</h2>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/50 p-5 rounded-3xl backdrop-blur-md">
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Won</p>
                <h2 className="text-2xl font-bold text-white">{leads.filter(l => l.status === 'Closed Won').length}</h2>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/50 p-5 rounded-3xl backdrop-blur-md">
                <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">Follow Ups</p>
                <h2 className="text-2xl font-bold text-white">{leads.filter(l => l.status === 'Follow Up').length}</h2>
            </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email, country, or exam..."
              className="w-full bg-slate-900/60 border border-slate-800/80 pl-12 pr-4 py-3.5 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder-slate-600"
            />
          </div>
          <select 
            value={status} 
            onChange={e => setStatus(e.target.value)} 
            className="bg-slate-900/60 border border-slate-800/80 px-6 py-3.5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer min-w-[180px]"
          >
            <option value="">All Statuses</option>
            {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-slate-500 text-[11px] uppercase tracking-[0.2em] font-black border-b border-slate-800/80">
                <th className="px-8 py-6">Lead Identity</th>
                <th className="px-8 py-6">Exam & Region</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {leads.length === 0 ? (
                <tr><td colSpan={4} className="py-24 text-center text-slate-500 italic">No matching leads found.</td></tr>
              ) : (
                leads.map(lead => {
                  const s = statusColors[lead.status || ''] || { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700', dot: 'bg-slate-500' }
                  return (
                    <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <Link href={`/leads/${lead.id}/edit`} className="block">
                            <span className="text-white font-bold text-base block group-hover:text-indigo-400 transition-colors">{lead.email}</span>
                            <span className="text-xs text-slate-600 font-mono mt-1 block">ID: {lead.id.slice(-8).toUpperCase()}</span>
                        </Link>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-slate-300 font-semibold block">{lead.exam || 'N/A'}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                            {lead.country || 'International'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${s.bg} ${s.text} ${s.border} text-xs font-bold`}>
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${s.dot}`} />
                          {lead.status}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                            onClick={() => setConfirmDelete(lead.id)} 
                            className="p-2 hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 rounded-xl transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* DELETE MODAL (Glassmorphism) */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <h3 className="text-white font-bold text-2xl mb-2">Are you sure?</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">Deleting this lead is permanent and cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3.5 rounded-2xl font-bold transition-colors">Yes, Delete</button>
                <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-2xl font-bold transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ADD LEAD MODAL (Immersive) */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl flex items-center justify-center z-[90] p-4">
            <div className="bg-[#0a0c10] border border-slate-800/80 w-full max-w-5xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative">
              <div className="p-8 border-b border-slate-800/50 flex justify-between items-center bg-slate-950/50">
                <div>
                    <h2 className="text-2xl font-black text-white">Create New Lead</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Candidate Registration</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-indigo-500/5">
                <LeadForm 
                    onSubmit={handleCreateLead} 
                    isLoading={isSubmitting} 
                    onCancel={() => setShowAddModal(false)}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
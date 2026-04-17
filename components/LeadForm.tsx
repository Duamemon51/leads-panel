'use client'

import { useState } from 'react'
import { Lead } from '@/types'

type LeadFormData = Omit<Lead, 'id' | 'createdAt'>

const emptyForm: LeadFormData = {
  email: '', country: '', address: '', phone: '', comptiaId: '', exam: '',
  examDate: '', price: '', orderNo: '', regId: '', status: 'New', vueId: '',
  city: '', state: '', postalCode: '', where: '', dateTime: '', who: '',
  payment: 'Pending', stateY: '', disposition: '', disposition2: '',
  linkedinProfile: '', remarks: ''
}

interface Props {
  initialData?: Partial<Lead>
  onSubmit: (data: LeadFormData) => void
  isLoading?: boolean
  isEdit?: boolean
  onCancel?: () => void   // ✅ FIX ADDED
}

const inputCls =
  "w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"

const labelCls =
  "block text-xs font-medium text-slate-400 mb-1"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
        <div className="w-1 h-4 bg-indigo-500 rounded-full" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  )
}

export default function LeadForm({
  initialData,
  onSubmit,
  isLoading,
  isEdit,
  onCancel
}: Props) {

  const [form, setForm] = useState<LeadFormData>({
    ...emptyForm,
    ...initialData
  })

  const set =
    (field: keyof LeadFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
    }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* CONTACT */}
      <Section title="Contact Information">
        <Field label="Email *">
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            required
            className={inputCls}
          />
        </Field>

        <Field label="Phone">
          <input
            value={form.phone}
            onChange={set('phone')}
            className={inputCls}
          />
        </Field>

        <Field label="LinkedIn">
          <input
            value={form.linkedinProfile}
            onChange={set('linkedinProfile')}
            className={inputCls}
          />
        </Field>

        <Field label="Country">
          <input
            value={form.country}
            onChange={set('country')}
            className={inputCls}
          />
        </Field>
      </Section>

      {/* EXAM */}
      <Section title="Exam Information">
        <Field label="CompTIA ID">
          <input
            value={form.comptiaId}
            onChange={set('comptiaId')}
            className={inputCls}
          />
        </Field>

        <Field label="VUE ID">
          <input
            value={form.vueId}
            onChange={set('vueId')}
            className={inputCls}
          />
        </Field>

        <Field label="Exam">
          <input
            value={form.exam}
            onChange={set('exam')}
            className={inputCls}
          />
        </Field>

        <Field label="Exam Date">
          <input
            type="date"
            value={form.examDate}
            onChange={set('examDate')}
            className={inputCls}
          />
        </Field>
      </Section>

      {/* STATUS */}
      <Section title="Lead Status">
        <Field label="Status">
          <input
            value={form.status}
            onChange={set('status')}
            className={inputCls}
          />
        </Field>

        <Field label="Who">
          <input
            value={form.who}
            onChange={set('who')}
            className={inputCls}
          />
        </Field>

        <Field label="Disposition">
          <input
            value={form.disposition}
            onChange={set('disposition')}
            className={inputCls}
          />
        </Field>
      </Section>

      {/* REMARKS */}
      <Section title="Remarks">
        <div className="md:col-span-3">
          <textarea
            value={form.remarks}
            onChange={set('remarks')}
            rows={4}
            className={inputCls}
          />
        </div>
      </Section>

      {/* BUTTONS */}
      <div className="flex gap-3 pt-2">

        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update Lead' : 'Create Lead'}
        </button>

        {/* ✅ FIXED CANCEL (NOW USES PROP) */}
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl"
        >
          Cancel
        </button>

      </div>
    </form>
  )
}
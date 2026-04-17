'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  LogOut, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'All Leads', icon: Users },
  // { href: '/leads/new', label: 'Add Lead', icon: UserPlus },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (err) {
        console.error("Failed to fetch user")
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } finally {
      router.push('/login')
    }
  }

  return (
    <aside className="w-64 min-h-screen bg-[#0f172a] border-r border-slate-800/50 flex flex-col transition-all duration-300">
      
      {/* LOGO SECTION */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="relative">
            <div className="absolute -inset-1 bg-indigo-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
          </div>
          <div>
            <h1 className="text-white font-bold tracking-tight text-lg leading-none">LeadPanel</h1>
            <span className="text-indigo-400/80 text-[10px] font-semibold uppercase tracking-wider">CompTIA Manager</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-1.5">
        <p className="px-2 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Main Menu</p>
        {navItems.map((item) => {
          const isActive = item.href === '/leads' 
            ? pathname.startsWith('/leads') 
            : pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.label}
              </div>
              
              {isActive && (
                <div className="absolute left-0 w-1 h-5 bg-indigo-500 rounded-r-full" />
              )}
              {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {/* FOOTER / USER SECTION */}
      <div className="p-4 mt-auto">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-tr from-slate-700 to-slate-600 rounded-full flex items-center justify-center border border-slate-600 ring-2 ring-slate-900">
                <span className="text-white text-xs font-bold">
                  {loading ? '...' : (user?.name?.[0]?.toUpperCase() ?? '?')}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0f172a] rounded-full"></div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-sm font-semibold truncate leading-none mb-1">
                {loading ? 'Loading...' : (user?.name || 'Guest User')}
              </p>
              <p className="text-slate-500 text-[11px] font-medium capitalize flex items-center gap-1">
                <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                {user?.role || 'Limited Access'}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </aside>
  )
}
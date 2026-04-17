import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LeadPanel | CompTIA Management',
  description: 'High-performance CompTIA Lead Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {/* Optional: Global background overlay to ensure depth across all pages */}
        <div className="fixed inset-0 -z-10 bg-[#0f172a]" />
        
        <main className="relative min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
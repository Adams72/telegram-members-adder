import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Telegram Members Adder | Add Members from CSV',
  description: 'Efficiently add members to your Telegram groups using CSV files. Bulk invite contacts with ease.',
  keywords: ['telegram', 'members', 'bulk invite', 'csv', 'automation'],
  openGraph: {
    title: 'Telegram Members Adder',
    description: 'Efficiently add members to your Telegram groups using CSV files',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0088cc',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}

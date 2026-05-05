import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confidente y Mentiroso',
  description: 'Un juego de deducción social para 3 o más jugadores.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-[#0f111a] text-white">
        {children}
      </body>
    </html>
  )
}

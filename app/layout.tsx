import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import Navigation from './components/Navigation'
import Footer from './components/Footer'

export const metadata: Metadata = {
  title: '알도AI - 어린이집 문서 작성 도우미',
  description: '어린이집 선생님을 위한 AI 문서 작성 도우미입니다.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-gray-50 flex flex-col min-h-screen">
        <Providers>
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

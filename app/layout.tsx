import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'
import { Providers } from './providers'
import Navbar from './components/Navbar'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UniPeer Tutoring',
  description: 'Find or become a peer tutor for your university courses',
};

export default function RootLayout({ children }: { children: React.ReactNode })  {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
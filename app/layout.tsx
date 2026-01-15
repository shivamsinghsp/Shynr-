import type { Metadata } from "next"
import { Geist, Geist_Mono, Figtree, Outfit } from "next/font/google"
import "./globals.css"

import TopBar from "@/components/layout/Topbar"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
})

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Shynr",
  description: "Talent & Career Solution Platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} ${outfit.variable} antialiased`}>

        <TopBar />
        <Navbar />

        <main className="min-h-screen">
          {children}
        </main>

        <Footer />

      </body>
    </html>
  )
}

import type { Metadata } from "next"
import { Figtree, Poppins } from "next/font/google"
import "./globals.css"

import TopBar from "@/components/layout/Topbar"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
})

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Shynr",
  description: "Talent & Career Solution Platform",
}

import FloatingCallButton from "@/components/shared/FloatingCallButton"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} ${poppins.variable} font-sans antialiased`}>

        <TopBar />
        <Navbar />

        <main className="min-h-screen">
          {children}
        </main>

        <FloatingCallButton />
        <Footer />

      </body>
    </html>
  )
}

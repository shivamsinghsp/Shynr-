"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown, Menu, X } from "lucide-react"

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null)

  const toggleMobileSubmenu = (menu: string) => {
    setMobileSubmenu(mobileSubmenu === menu ? null : menu)
  }

  return (
    <div className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-3xl font-bold tracking-tight">
          Shynr<span style={{ color: "#39FF14" }}>.</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex gap-8 items-center text-gray-700 font-medium">

          {/* ABOUT US */}
          <div
            className="relative group"
            onMouseEnter={() => setOpenMenu("about")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <span className="flex items-center gap-1 cursor-pointer hover:text-[#39FF14] transition-colors py-2">
              About Us
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${openMenu === "about" ? "rotate-180" : ""}`}
              />
            </span>

            <div
              className={`absolute left-0 top-full w-64 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden transition-all duration-300 ${openMenu === "about" ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-2 invisible"
                }`}
            >
              <Link href="/about/company" className="block px-6 py-3 hover:bg-gray-50 hover:text-[#39FF14] transition-colors">
                Company Profile
              </Link>
              <Link href="/about/leadership" className="block px-6 py-3 hover:bg-gray-50 hover:text-[#39FF14] transition-colors">
                Leadership Team
              </Link>
              <Link href="/about/csr" className="block px-6 py-3 hover:bg-gray-50 hover:text-[#39FF14] transition-colors">
                CSR
              </Link>
            </div>
          </div>

          {/* SERVICES */}
          <div
            className="relative group"
            onMouseEnter={() => setOpenMenu("services")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <span className="flex items-center gap-1 cursor-pointer hover:text-[#39FF14] transition-colors py-2">
              Services
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${openMenu === "services" ? "rotate-180" : ""}`}
              />
            </span>

            <div
              className={`absolute left-0 top-full w-64 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden transition-all duration-300 ${openMenu === "services" ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-2 invisible"
                }`}
            >
              <Link href="/services/general_staffing" className="block px-6 py-3 hover:bg-gray-50 hover:text-[#39FF14] transition-colors">
                General Staffing
              </Link>
              <Link href="/services/professional_staffing" className="block px-6 py-3 hover:bg-gray-50 hover:text-[#39FF14] transition-colors">
                Professional Staffing
              </Link>
              <Link href="/services/digital_platform" className="block px-6 py-3 hover:bg-gray-50 hover:text-[#39FF14] transition-colors">
                Digital Platform
              </Link>
            </div>
          </div>

          <Link href="/careers" className="hover:text-[#39FF14] transition-colors">Careers</Link>
          <Link href="/media" className="hover:text-[#39FF14] transition-colors">Media</Link>
          <Link href="/contactUs" className="hover:text-[#39FF14] transition-colors">Contact Us</Link>

          {/* Jobs Button */}
          <Link
            href="/jobs"
            className="px-6 py-3 rounded-full font-bold transition-all hover:scale-105 shadow-[0_4px_14px_0_rgba(57,255,20,0.39)]"
            style={{ backgroundColor: "#39FF14", color: "#0a0a0a" }}
          >
            Jobs
          </Link>
        </nav>

        {/* MOBILE MENU TOGGLE */}
        <button
          className="md:hidden p-2 text-gray-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t h-[calc(100vh-80px)] overflow-y-auto">
          <div className="flex flex-col p-6 space-y-4 font-medium text-lg text-gray-800">

            {/* Mobile About */}
            <div>
              <button
                onClick={() => toggleMobileSubmenu("about")}
                className="flex items-center justify-between w-full py-2 border-b border-gray-100"
              >
                About Us
                <ChevronDown size={20} className={`transition-transform ${mobileSubmenu === "about" ? "rotate-180" : ""}`} />
              </button>
              {mobileSubmenu === "about" && (
                <div className="pl-4 mt-2 space-y-3 text-base text-gray-600 border-l-2 border-[#39FF14]">
                  <Link href="/about/company" onClick={() => setMobileMenuOpen(false)} className="block py-1">Company Profile</Link>
                  <Link href="/about/leadership" onClick={() => setMobileMenuOpen(false)} className="block py-1">Leadership Team</Link>
                  <Link href="/about/csr" onClick={() => setMobileMenuOpen(false)} className="block py-1">CSR</Link>
                </div>
              )}
            </div>

            {/* Mobile Services */}
            <div>
              <button
                onClick={() => toggleMobileSubmenu("services")}
                className="flex items-center justify-between w-full py-2 border-b border-gray-100"
              >
                Services
                <ChevronDown size={20} className={`transition-transform ${mobileSubmenu === "services" ? "rotate-180" : ""}`} />
              </button>
              {mobileSubmenu === "services" && (
                <div className="pl-4 mt-2 space-y-3 text-base text-gray-600 border-l-2 border-[#39FF14]">
                  <Link href="/services/general_staffing" onClick={() => setMobileMenuOpen(false)} className="block py-1">General Staffing</Link>
                  <Link href="/services/professional_staffing" onClick={() => setMobileMenuOpen(false)} className="block py-1">Professional Staffing</Link>
                  <Link href="/services/digital_platform" onClick={() => setMobileMenuOpen(false)} className="block py-1">Digital Platform</Link>
                </div>
              )}
            </div>

            <Link href="/careers" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-gray-100">Careers</Link>
            <Link href="/media" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-gray-100">Media</Link>
            <Link href="/contactUs" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-gray-100">Contact Us</Link>

            <Link
              href="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 text-center py-3 rounded-full font-bold shadow-lg"
              style={{ backgroundColor: "#39FF14", color: "#0a0a0a" }}
            >
              Jobs
            </Link>

          </div>
        </div>
      )}
    </div>
  )
}

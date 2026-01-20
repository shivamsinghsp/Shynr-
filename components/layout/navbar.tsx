"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { ChevronDown, Menu, X } from "lucide-react"

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null)

  const toggleMobileSubmenu = (menu: string) => {
    setMobileSubmenu(mobileSubmenu === menu ? null : menu)
  }

  return (
    <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="relative flex items-center w-60 h-10">
          <Image
            src="/3.png"
            alt="Shynr"
            width={320}
            height={130}
            className="absolute top-[-34px] left-0 h-32 w-auto object-contain max-w-none"
            priority
          />
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex gap-8 items-center text-neutral-700 font-medium">

          {/* ABOUT US */}
          <div
            className="relative group h-full flex items-center"
            onMouseEnter={() => setOpenMenu("about")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <span className="flex items-center gap-1 cursor-pointer transition-colors py-2 relative group-hover:text-[#05033e]">
              About Us
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${openMenu === "about" ? "rotate-180" : ""}`}
              />
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#05033e] transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left`}></span>
            </span>

            <div
              className={`absolute left-0 top-full w-64 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden transition-all duration-300 ${openMenu === "about" ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-2 invisible"
                }`}
            >
              <DropdownLink href="/about/company" onClick={() => setOpenMenu(null)}>Company Profile</DropdownLink>
              <DropdownLink href="/about/leadership" onClick={() => setOpenMenu(null)}>Leadership Team</DropdownLink>
              <DropdownLink href="/about/csr" onClick={() => setOpenMenu(null)}>CSR</DropdownLink>
            </div>
          </div>

          {/* SERVICES */}
          <div
            className="relative group h-full flex items-center"
            onMouseEnter={() => setOpenMenu("services")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <span className="flex items-center gap-1 cursor-pointer transition-colors py-2 relative group-hover:text-[#05033e]">
              Services
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${openMenu === "services" ? "rotate-180" : ""}`}
              />
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#05033e] transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left`}></span>
            </span>

            <div
              className={`absolute left-0 top-full w-64 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden transition-all duration-300 ${openMenu === "services" ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-2 invisible"
                }`}
            >
              <DropdownLink href="/services/general_staffing" onClick={() => setOpenMenu(null)}>General Staffing</DropdownLink>
              <DropdownLink href="/services/professional_staffing" onClick={() => setOpenMenu(null)}>Professional Staffing</DropdownLink>
              <DropdownLink href="/services/digital_platform" onClick={() => setOpenMenu(null)}>Digital Platform</DropdownLink>
            </div>
          </div>

          <NavLink href="/careers">Careers</NavLink>
          <NavLink href="/media">Media</NavLink>
          <NavLink href="/contactUs">Contact Us</NavLink>

          <Link
            href="/auth/signin"
            className="px-6 py-3 rounded-full font-bold transition-all duration-300 border border-transparent hover:border-[#05033e] bg-[#05033e] text-white hover:bg-[#020120] hover:text-white shadow-[0_4px_14px_0_rgba(5,3,62,0.39)] hover:shadow-[0_0_20px_rgba(5,3,62,0.4)]"
          >
            Jobs
          </Link>
        </nav>

        {/* MOBILE MENU TOGGLE */}
        <button
          className="md:hidden p-2 text-neutral-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-t border-white/20 h-[calc(100vh-80px)] overflow-y-auto">
          <div className="flex flex-col p-6 space-y-4 font-medium text-lg text-neutral-800">

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
                <div className="pl-4 mt-2 space-y-3 text-base text-neutral-600 border-l-2 border-[#05033e]">
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
                <div className="pl-4 mt-2 space-y-3 text-base text-neutral-600 border-l-2 border-[#05033e]">
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
              href="/auth/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 text-center py-3 rounded-full font-bold shadow-lg"
              style={{ backgroundColor: "#05033e", color: "white" }}
            >
              Jobs
            </Link>

          </div>
        </div>
      )}
    </div>
  )
}

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative py-1 transition-colors duration-300 hover:text-[#05033e]
                 ${isActive ? "text-[#05033e]" : ""}`}
    >
      {children}
      <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#05033e] transform transition-transform duration-300 origin-left 
                       ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 hover:scale-x-100"}`}>
      </span>
    </Link>
  )
}

function DropdownLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-6 py-3 transition-colors duration-300 hover:bg-white/50 hover:text-[#05033e]
                 ${isActive ? "text-[#05033e] bg-white/50" : ""}`}
    >
      {children}
    </Link>
  )
}

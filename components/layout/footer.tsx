"use client"

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-gray-900">

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* Brand */}
        <div>
          <h2 className="text-3xl font-bold mb-4">
            Shynr<span style={{ color: "#39FF14" }}>.</span>
          </h2>
          <p className="text-gray-400 leading-relaxed text-sm">
            Talent & Career Solution Platform. Building scalable, compliant, and high-performance workforces across India.
          </p>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-bold text-lg mb-5 text-white">Company</h3>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><Link href="/about/company" className="hover:text-[#39FF14] transition-colors">About Us</Link></li>
            <li><Link href="/about/leadership" className="hover:text-[#39FF14] transition-colors">Leadership Team</Link></li>
            <li><Link href="/media" className="hover:text-[#39FF14] transition-colors">Media Centre</Link></li>
            <li><Link href="/jobs" className="hover:text-[#39FF14] transition-colors">Jobs</Link></li>
            <li><Link href="/contactUs" className="hover:text-[#39FF14] transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="font-bold text-lg mb-5 text-white">Services</h3>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><Link href="/services/general_staffing" className="hover:text-[#39FF14] transition-colors">General Staffing</Link></li>
            <li><Link href="/services/professional_staffing" className="hover:text-[#39FF14] transition-colors">Professional Staffing</Link></li>
            <li><Link href="/services/digital_platform" className="hover:text-[#39FF14] transition-colors">Digital Platform</Link></li>
            <li><Link href="/about/csr" className="hover:text-[#39FF14] transition-colors">CSR Initiatives</Link></li>
          </ul>
        </div>

        {/* Subscribe */}
        <div>
          <h3 className="font-bold text-lg mb-5 text-white">Stay Connected</h3>
          <p className="text-gray-400 text-sm mb-4">
            Get hiring updates and job alerts in your inbox.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              alert("Subscribed!")
            }}
            className="flex flex-col gap-3"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg bg-[#111] border border-gray-800 text-white outline-none focus:border-[#39FF14] transition-colors"
            />

            <button
              type="submit"
              className="py-3 rounded-lg font-bold text-[#0a0a0a] transition-all hover:scale-105"
              style={{ backgroundColor: "#39FF14", boxShadow: "0 0 10px rgba(57,255,20,0.3)" }}
            >
              Subscribe now
            </button>
          </form>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-900 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <span>© 2025 SHYNR Private Limited | All Rights Reserved</span>

          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>

    </footer>
  )
}

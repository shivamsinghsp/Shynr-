"use client"

import Link from "next/link"
import { Mail, Phone } from "lucide-react"

export default function Footer() {
  return (
    <footer id="main-footer" className="w-full">
      {/* CTA Section */}
      <div
        className="py-20 px-6 text-center"
        style={{ backgroundColor: "#05033e" }} // Navy Blue
      >
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
          Ready to transform your workforce?
        </h2>
        <Link
          href="/contactUs"
          className="inline-block px-8 py-4 rounded-full font-bold text-lg transition-all  border border-transparent hover:border-white bg-white text-[#05033e] hover:bg-[#05033e] hover:text-white shadow-[0_0_20px_rgba(5,3,62,0.4)] hover:shadow-[0_0_30px_rgba(5,3,62,0.6)]"
        >
          Partner With SHYNR
        </Link>
      </div>

      {/* Main Footer Content */}
      <div
        className="pt-20 pb-10 border-t border-[#05033e]/20"
        style={{ backgroundColor: "#020120" }} // Very Dark Navy
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">
              Shynr<span className="text-[#05033e]">.</span>
            </h2>
            <p className="text-gray-400 leading-relaxed text-sm pr-4">
              Talent & Career Solution Platform. Building scalable, compliant, and high-performance workforces across India.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Company</h3>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><Link href="/about/company" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/about/leadership" className="hover:text-white transition-colors">Leadership Team</Link></li>
              <li><Link href="/media" className="hover:text-white transition-colors">Media Centre</Link></li>
              <li><Link href="/jobs" className="hover:text-white transition-colors">Jobs</Link></li>
              <li><Link href="/contactUs" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Services</h3>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><Link href="/services/general_staffing" className="hover:text-white transition-colors">General Staffing</Link></li>
              <li><Link href="/services/professional_staffing" className="hover:text-white transition-colors">Professional Staffing</Link></li>
              <li><Link href="/services/digital_platform" className="hover:text-white transition-colors">Digital Platform</Link></li>
              <li><Link href="/about/csr" className="hover:text-white transition-colors">CSR Initiatives</Link></li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Stay Connected</h3>
            <p className="text-gray-400 text-sm mb-6">
              Get hiring updates and job alerts in your Inbox.
            </p>

            <div className="space-y-4">
              <a
                href="mailto:info@shynr.in"
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm">info@shynr.in</span>
              </a>

              <a
                href="tel:06127180789"
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm">0612-7180789</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 pt-8 border-t border-[#05033e]/10">
          <p>© 2025 SHYNR Private Limited | All Rights Reserved</p>

          <div className="flex gap-8 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Users, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

export default function GeneralStaffing() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <main className="bg-white overflow-x-hidden">

      {/* HERO */}
      <section
        className="relative min-h-[50vh] md:h-[60vh] flex items-center justify-center text-center px-6 overflow-hidden"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/70 z-10" />
          <img src="/images/industrial-worker.png" alt="General Staffing Hero" className="w-full h-full object-cover" />
        </div>

        {/* Neon Glow Line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 z-[2]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #39FF14 50%, transparent 100%)",
            boxShadow: "0 0 20px #39FF14, 0 0 40px #39FF14"
          }}
        />

        <div className={`relative z-10 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h1 className="text-white text-4xl md:text-6xl font-bold mb-4">
            General <span style={{ color: "#39FF14", textShadow: "0 0 20px rgba(57,255,20,0.3)" }}>Staffing</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Building Reliable Workforces at Scale
          </p>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <div className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a0a0a] mb-8">
              General Staffing <span className="text-[#39FF14]" style={{ textShadow: "0 2px 10px rgba(57,255,20,0.3)" }}>Solutions</span>
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed max-w-4xl mx-auto">
              SHYNR Private Limited provides end-to-end General Staffing solutions designed to support organizations with high-volume and operational workforce requirements. We help businesses maintain agility, continuity, and productivity by supplying skilled and semi-skilled manpower across industries helping clients scale up or down quickly while ensuring compliance and cost efficiency.
            </p>
          </div>

        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 bg-gray-50">

        <h3 className="text-3xl font-bold text-center text-[#0a0a0a] mb-16">
          Our Services
        </h3>

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Bulk Hiring */}
          <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-[#39FF14]">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#0a0a0a] rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Users className="w-10 h-10 text-[#39FF14]" />
              </div>

              <h4 className="text-2xl font-bold text-gray-900 mb-4">
                Bulk Hiring & Deployment
              </h4>

              <p className="text-gray-600 leading-relaxed">
                Rapid mobilization of workforce for large-scale operational needs. We handle the entire lifecycle from sourcing to deployment.
              </p>
            </div>
          </div>

          {/* Contract Staffing */}
          <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-[#39FF14]">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-[#0a0a0a] rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Settings className="w-10 h-10 text-[#39FF14]" />
              </div>

              <h4 className="text-2xl font-bold text-gray-900 mb-4">
                Contract Staffing
              </h4>

              <p className="text-gray-600 leading-relaxed">
                Flexible staffing solutions with full compliance and payroll management, allowing you to focus on your core business.
              </p>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-20 flex justify-center px-6">
          <button
            onClick={() => router.push("/contactUs")}
            className="px-12 py-4 rounded-full font-bold text-lg transition-all hover:scale-105"
            style={{
              backgroundColor: "#39FF14",
              color: "#0a0a0a",
              boxShadow: "0 0 20px rgba(57,255,20,0.4)"
            }}
          >
            Partner With SHYNR
          </button>
        </div>

      </section>

    </main>
  )
}

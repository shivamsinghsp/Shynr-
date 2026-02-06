"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"

const insights = [
  {
    title: "Abhishek Kumar",
    description:
      "Founder & Managing Director. Leads business strategy, workforce solutions, and high-volume hiring operations.",
    image: "/images/team/Abhishek Kumar.jpeg",
    position: "object-top"
  },
  {
    title: "Shivanshi Verma",
    description:
      "Director. Expertise in strategic planning, governance, compliance, and organizational development.",
    image: "/images/team/Monika_Verma.png"
  },
  {
    title: "Monika Verma",
    description:
      "Director. Focuses on operations oversight, administration, internal controls, and stakeholder management.",
    image: "/images/team/Shivanshi_Verma.jpg"
  }
]

export default function LeadershipPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <main className="bg-white overflow-x-hidden">

      {/* Hero */}
      <section
        className="relative min-h-[50vh] md:h-[60vh] flex items-center justify-center text-center px-6 overflow-hidden"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/70 z-10" />
          <img src="/images/leadership-hero.png" alt="Leadership Hero" className="w-full h-full object-cover" />
        </div>

        {/* Neon Glow Line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 z-[2]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #05033e 50%, transparent 100%)",
            boxShadow: "0 0 20px #05033e, 0 0 40px #05033e"
          }}
        />

        <div className={`relative z-10 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h1 className="text-white text-4xl md:text-6xl font-bold mb-4">
            Leadership <span style={{ color: "#96c2ecff", textShadow: "0 0 20px rgba(5,3,62,0.3)" }}>Team</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Guiding SHYNR with Vision, Governance & Growth
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <div className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-[#0a0a0a]">
              Board of <span className="text-[#05033e]" style={{ textShadow: "0 2px 10px rgba(5,3,62,0.3)" }}>Directors</span>
            </h2>

            <p className="text-lg md:text-xl font-medium max-w-4xl mx-auto leading-relaxed mb-16 text-gray-700">
              The Board of Directors at SHYNR Private Limited brings together strategic insight,
              operational expertise, and strong governance to steer the organization's long-term growth.
              The board plays a critical role in defining strategy, ensuring compliance, and strengthening
              SHYNR's position as a trusted workforce solutions partner.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {insights.map((member, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:border-[#05033e] transition-all duration-500 hover:-translate-y-2 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                style={{ transitionDelay: `${500 + i * 200}ms` }}
              >
                <div className="relative w-40 h-40 mx-auto mb-8 rounded-full overflow-hidden border-4 border-gray-200 group-hover:border-[#05033e] transition-colors">
                  <img
                    src={member.image}
                    alt={member.title}
                    className={`w-full h-full object-cover ${member.position || ''}`}
                  />
                </div>

                <h3 className="font-bold text-2xl text-gray-900 mb-2">{member.title}</h3>

                <p className="text-gray-600 leading-relaxed text-sm">
                  {member.description}
                </p>
              </div>
            ))}
          </div>

          <div className={`mt-20 transition-all duration-1000 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <Link
              href="/contactUs"
              className="inline-block px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 bg-[#05033e] text-white hover:bg-white hover:text-[#05033e]"
              style={{
                boxShadow: "0 0 20px rgba(5,3,62,0.4)"
              }}
            >
              Connect With Us
            </Link>
          </div>

        </div>
      </section>
    </main>
  )
}

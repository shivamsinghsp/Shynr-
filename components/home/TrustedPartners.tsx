"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"

export default function TrustedPartners() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // SHYNR's trusted partner companies
  const partners = [
    { name: "Jana Small Finance Bank", logo: "/partners/jana-bank.png" },
    { name: "Axis Max Life Insurance", logo: "/partners/axis-max-life.png" },
    { name: "Lenskart", logo: "/partners/lenskart.png" },
    { name: "JustDial", logo: "/partners/justdial.png" },
    { name: "Digitide", logo: "/partners/digitide.png" },
    { name: "Paytm", logo: "/partners/paytm.png" },
    { name: "AllDigi", logo: "/partners/alldigi.png" },
    { name: "Himalaya Opticals", logo: "/partners/himalaya-opticals.png" },
    { name: "Vaco Binary Semantics", logo: "/partners/vaco.png" },
    { name: "CMS", logo: "/partners/cms.png" },
    { name: "L&T Finance", logo: "/partners/lt-finance.png" },
    { name: "HDB Finance", logo: "/partners/hdb-finance.png" },
  ]

  return (
    <section ref={sectionRef} className="relative overflow-hidden">

      {/* Header section with dark theme */}
      <div
        className="py-24 relative"
        style={{
          background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)"
        }}
      >
        {/* Background glow */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "#39FF14" }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <p
            className={`font-semibold text-2xl mb-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            style={{ color: "#39FF14" }}
          >
            Trusted Partners
          </p>

          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 text-white transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            Companies We{" "}
            <span
              style={{
                color: "#39FF14",
                textShadow: "0 0 15px rgba(57,255,20,0.4)"
              }}
            >
              Work With
            </span>
          </h2>

          <p
            className={`max-w-3xl text-gray-400 leading-relaxed transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            SHYNR Private Limited partners with leading organizations across BFSI, FinTech, Retail, E-commerce,
            and IT-enabled services. Our strong industry partnerships enable us to deliver reliable, scalable,
            and compliant workforce solutions to businesses of all sizes.
          </p>

          {/* Stats */}
          <div className={`flex flex-wrap gap-12 mt-10 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div>
              <h3 className="text-4xl font-bold" style={{ color: "#39FF14" }}>25+</h3>
              <p className="text-gray-400 mt-1">Companies Served</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold" style={{ color: "#39FF14" }}>28</h3>
              <p className="text-gray-400 mt-1">States Presence</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold" style={{ color: "#39FF14" }}>15,000+</h3>
              <p className="text-gray-400 mt-1">Professionals Hired</p>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee section with neon theme */}
      <div
        className="py-12 overflow-hidden relative"
        style={{
          background: "linear-gradient(90deg, #0a0a0a 0%, rgba(57,255,20,0.1) 50%, #0a0a0a 100%)"
        }}
      >
        {/* Top and bottom glow lines */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, #39FF14, transparent)",
            boxShadow: "0 0 10px #39FF14"
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, #39FF14, transparent)",
            boxShadow: "0 0 10px #39FF14"
          }}
        />

        <div className="relative w-full">
          {/* Gradient edges for fade */}
          <div
            className="absolute left-0 top-0 h-full w-24 z-10"
            style={{ background: "linear-gradient(to right, #0a0a0a, transparent)" }}
          />
          <div
            className="absolute right-0 top-0 h-full w-24 z-10"
            style={{ background: "linear-gradient(to left, #0a0a0a, transparent)" }}
          />

          {/* Marquee Track */}
          <div className="marquee-track gap-16 px-8">
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={index}
                className="group relative h-12 min-w-[180px] flex-shrink-0 flex items-center justify-center px-6 py-3 rounded-lg transition-all duration-300 hover:scale-110"
                style={{
                  background: "rgba(57,255,20,0.05)",
                  border: "1px solid rgba(57,255,20,0.2)",
                }}
              >
                <span
                  className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors whitespace-nowrap"
                  style={{ textShadow: "0 0 10px rgba(57,255,20,0.3)" }}
                >
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}


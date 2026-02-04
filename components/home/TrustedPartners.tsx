"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import CountUp from "@/components/shared/CountUp"

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
    { name: "Jana Small Finance Bank", logo: "/Jana Small Finance Bank Logo.png", url: "https://www.janabank.com/" },
    { name: "Axis Max Life Insurance", logo: "/home/axis-bank.png", url: "https://www.axisbank.com/" },
    { name: "Lenskart", logo: "/home/Lenskart.png", url: "https://www.lenskart.com/" },
    { name: "JustDial", logo: "/home/justdial.png", url: "https://www.justdial.com/" },
    { name: "Digitide", logo: "/home/DIGITIDE.jpg", url: "https://www.digitidesolutions.com/" },
    { name: "Paytm", logo: "/home/Paytm.png", url: "https://paytm.com/" },
    // { name: "AllDigi", logo: "/home/vaco.jpg", url: "" },
    // { name: "Himalaya Opticals", logo: "/home/vaco.jpg", url: "" },
    { name: "Vaco Binary Semantics", logo: "/home/vaco.jpg", url: "https://vacobinarysemantics.com/" },
    // { name: "CMS", logo: "/home/vaco.jpg", url: "" },
    { name: "L&T Finance", logo: "/home/L&T_Finance.png", url: "https://www.ltfs.com/" },
    { name: "HDB Finance", logo: "/home/HDB_Finance.png", url: "https://www.hdbfs.com/" },
  ]

  return (
    <section ref={sectionRef} className="relative overflow-hidden">

      {/* Header section with dark theme */}
      <div
        className="py-24 relative"
        style={{
          background: "white"
        }}
      >
        {/* Background glow */}
        {/* Background glow removed as per request */}

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <p
            className={`font-semibold text-2xl mb-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            style={{ color: "#05033e" }}
          >
            Trusted Partners
          </p>

          <h2
            className={`text-4xl md:text-5xl font-bold mb-6 text-foreground transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            Companies We{" "}
            <span
              style={{
                color: "#05033e",
                textShadow: "0 0 15px rgba(5,3,62,0.4)"
              }}
            >
              Work With
            </span>
          </h2>

          <p
            className={`max-w-3xl text-muted-foreground leading-relaxed transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            SHYNR Private Limited partners with leading organizations across BFSI, FinTech, Retail, E-commerce,
            and IT-enabled services. Our strong industry partnerships enable us to deliver reliable, scalable,
            and compliant workforce solutions to businesses of all sizes.
          </p>

          {/* Stats */}
          <div className={`flex flex-wrap gap-12 mt-10 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div>
              <h3 className="text-4xl font-bold" style={{ color: "#05033e" }}>
                <CountUp end={25} suffix="+" />
              </h3>
              <p className="text-muted-foreground mt-1">Companies Served</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold" style={{ color: "#05033e" }}>
                <CountUp end={28} />
              </h3>
              <p className="text-muted-foreground mt-1">States Presence</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold" style={{ color: "#05033e" }}>
                <CountUp end={15000} suffix="+" />
              </h3>
              <p className="text-muted-foreground mt-1">Professionals Hired</p>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee section with neon theme */}
      <div
        className="py-12 overflow-hidden relative"
        style={{
          background: "white"
        }}
      >
        {/* Top and bottom glow lines */}
        {/* Top and bottom glow lines removed as per request */}

        <div className="relative w-full">
          {/* Gradient edges for fade */}
          <div
            className="absolute left-0 top-0 h-full w-24 z-10"
            style={{ background: "linear-gradient(to right, var(--background), transparent)" }}
          />
          <div
            className="absolute right-0 top-0 h-full w-24 z-10"
            style={{ background: "linear-gradient(to left, var(--background), transparent)" }}
          />

          {/* Marquee Track */}
          <div className="marquee-track gap-16 px-8">
            {[...partners, ...partners].map((partner, index) => (
              <Link
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                key={index}
                className="group relative h-32 min-w-[160px] flex-shrink-0 flex items-center justify-center px-4 transition-all duration-300"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-40 h-40 object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}


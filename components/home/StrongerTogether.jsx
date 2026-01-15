"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"

export default function StrongerTogether() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

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

  return (
    <section
      ref={sectionRef}
      className="py-32 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, var(--background) 0%, rgba(57,255,20,0.05) 50%, var(--background) 100%)"
      }}
    >
      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">

        <p
          className={`text-3xl font-semibold mb-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          style={{ color: "#39FF14" }}
        >
          Stronger Together
        </p>

        <h2
          className={`text-4xl md:text-6xl font-bold leading-tight mb-8 text-foreground transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
        >
          Spreading smiles and <br />
          building{" "}
          <span
            style={{
              color: "#39FF14",
              textShadow: "0 0 20px rgba(57,255,20,0.5)"
            }}
          >
            sustainable
          </span> <br />
          relationships
        </h2>

        <p
          className={`max-w-3xl mx-auto text-muted-foreground leading-relaxed mb-12 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
        >
          At eu lobortis pretium ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
          Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,
          quis gravida magna mi a libero. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Tincidunt amet lacus ut aenean aliquet. Blandit a massa elementum id scelerisque rhoncus.
        </p>

        {/* CTA with neon glow */}
        <Link
          href="/contact"
          className={`inline-flex items-center justify-center px-10 py-4 rounded-md font-semibold text-lg
                     transition-all duration-300 border border-transparent hover:border-[#39FF14]
                     bg-[#39FF14] text-[#0a0a0a] hover:bg-black hover:text-[#39FF14]
                     shadow-[0_0_25px_rgba(57,255,20,0.5)] hover:shadow-[0_0_35px_rgba(57,255,20,0.7)]
                     ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          style={{
            transitionDelay: "300ms"
          }}
        >
          Explore More
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>

        {/* Media Grid with staggered animation */}
        <div className="mt-20 grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`h-56 md:h-72 rounded-3xl transition-all duration-700 hover:scale-[1.03] cursor-pointer ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                }`}
              style={{
                transitionDelay: `${400 + index * 150}ms`,
                background: index === 1
                  ? "linear-gradient(135deg, #39FF14 0%, #00d4aa 100%)"
                  : "linear-gradient(135deg, var(--card) 0%, var(--muted) 100%)",
                border: "1px solid rgba(57,255,20,0.2)",
                boxShadow: index === 1 ? "0 0 30px rgba(57,255,20,0.3)" : "none"
              }}
            />
          ))}
        </div>

      </div>
    </section>
  )
}

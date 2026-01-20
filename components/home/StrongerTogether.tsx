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
        background: "white"
      }}
    >
      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">

        <p
          className={`text-3xl font-semibold mb-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          style={{ color: "#05033e" }}
        >
          Stronger Together
        </p>

        <h2
          className={`text-4xl md:text-6xl  text-[#05033e] font-bold leading-tight mb-8 text-foreground transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
        >
          <span
            style={{
              color: "#05033e",
            }}
          >
            Spreading smiles and <br />
            building{" "}

            sustainable

            relationships

          </span> <br />
        </h2>

        <p
          className={`max-w-3xl mx-auto text-muted-foreground leading-relaxed mb-12 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
        >
          We believe in the power of collaboration. By connecting the right people with the right opportunities,
          we build stronger communities and successful businesses. Our commitment goes beyond placing candidates –
          we build lasting partnerships that drive growth and innovation. Together, we create a future where
          talent meets opportunity seamlessly.
        </p>

        {/* CTA with neon glow */}
        <Link
          href="/about/leadership"
          className={`inline-flex items-center justify-center px-10 py-4 rounded-md font-semibold text-lg
                     transition-all  border border-transparent hover:border-[#05033e]
                     bg-[#05033e] text-white hover:bg-white hover:text-[#05033e]
                     shadow-[0_0_25px_rgba(5,3,62,0.5)] hover:shadow-[0_0_35px_rgba(5,3,62,0.7)]
                     ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}

        >
          Explore More
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>

        {/* Media Grid with staggered animation */}
        <div className="mt-20 grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          {["/home/job.jpg", "/home/job2.jpg", "/home/job3.jpg", "/home/job4.jpg"].map((src, index) => (
            <div
              key={index}
              className={`relative h-56 md:h-72 rounded-3xl overflow-hidden transition-all duration-700 hover:scale-[1.03] cursor-pointer ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                }`}
              style={{
                transitionDelay: `${400 + index * 150}ms`,
                border: "1px solid rgba(5,3,62,0.1)", // Subtle border instead of shadow if needed, or remove completely if strict "no shadow" implies flat.
                // User said "dont put shadow", so I will strictly obey that.
              }}
            >
              <img
                src={src}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

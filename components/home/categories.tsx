"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import CountUp from "@/components/shared/CountUp"

// SVG icons for categories
const AgricultureIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M12 21v-1.5M8.25 4.5l.75 1.3M15 18.2l.75 1.3M4.5 8.25l1.3.75M18.2 15l1.3.75M3 12h1.5M21 12h-1.5M4.5 15.75l1.3-.75M18.2 9l1.3-.75M8.25 19.5l.75-1.3M15 5.8l.75-1.3" />
  </svg>
)

const MetalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
)

const FinanceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const TransportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
  </svg>
)


// Arrow icons pulled from Lucide
import { ArrowLeft, ArrowRight } from "lucide-react"


const cards = [
  { title: "Agriculture", jobs: 1254, icon: <AgricultureIcon /> },
  { title: "Metal Production", jobs: 816, icon: <MetalIcon /> },
  { title: "Financial Services", jobs: 1529, icon: <FinanceIcon /> },
  { title: "Transport", jobs: 1244, icon: <TransportIcon /> },
  { title: "Agriculture", jobs: 1254, icon: <AgricultureIcon /> },
  { title: "Metal Production", jobs: 816, icon: <MetalIcon /> },
  { title: "Financial Services", jobs: 1529, icon: <FinanceIcon /> },
  { title: "Transport", jobs: 1244, icon: <TransportIcon /> }
]

export default function Categories() {
  const slider = useRef<HTMLDivElement>(null)
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

  const scroll = (dir: "left" | "right") => {
    if (!slider.current) return
    slider.current.scrollBy({
      left: dir === "left" ? -350 : 350,
      behavior: "smooth"
    })
  }

  return (
    <section
      ref={sectionRef}
      className="py-20 relative overflow-hidden bg-white"
    >
      {/* Heading */}
      <div
        className={`text-center mb-12 px-6 text-foreground transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
      >
        <p
          className="font-semibold text-lg md:text-2xl mb-2"
          style={{ color: "#05033e" }}
        >
          Why Choose Us
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mt-2">
          Key Differentiators
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground text-sm md:text-base">
          At eu lobortis pretium tincidunt amet lacus ut aenean aliquet.
          Blandit a massa elementum id scelerisque.
        </p>
      </div>

      {/* Arrows with neon style */}
      {/* Slider Container */}
      <div className="relative group">

        {/* Slider */}
        <div
          ref={slider}
          className="flex gap-8 overflow-x-auto overflow-y-visible px-6 md:px-16 
                    scroll-smooth snap-x snap-mandatory no-scrollbar py-10"
        >
          {cards.map((card, i) => (
            <Link
              key={i}
              href={`/categories/${card.title.toLowerCase().replace(/\s+/g, "-")}`}
              className={`snap-start min-w-[240px] sm:min-w-[280px] 
                         h-[360px] md:h-[420px] 
                         flex items-center justify-center
                         transition-all duration-700
                         ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div
                className="bg-card w-full h-full rounded-2xl 
                          flex flex-col items-center justify-center 
                          border border-border
                          transition-all duration-500 ease-out
                          hover:-translate-y-4
                          will-change-transform group"
                style={{
                  boxShadow: "0 0 30px rgba(0,0,0,0.1)",
                  backgroundColor: `hsl(210, 100%, ${96 - (i % 3) * 2}%)` // e.g., 96%, 94%, 92% lightness for variations of light blue
                }}
              >
                <div
                  className="text-white mb-6 transition-transform duration-300 group-hover:scale-125"
                  style={{ color: "#05033e" }}
                >
                  {card.icon}
                </div>

                <h3 className="text-lg md:text-xl font-bold mb-3 text-card-foreground">
                  {card.title}
                </h3>

                <span
                  className="px-4 py-1 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: "rgba(5,3,62,0.2)",
                    color: "#05033e",
                    border: "1px solid #05033e"
                  }}
                >
                  <CountUp end={card.jobs} duration={1500} /> jobs
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Centered Arrows Below */}
        <div className="flex justify-center items-center gap-6 mt-8">
          <button
            onClick={() => scroll("left")}
            className="w-14 h-14 rounded-full shadow items-center justify-center z-20 transition-all duration-300 hover:scale-110 flex"
            style={{
              backgroundColor: "#05033e",
              color: "white",
              boxShadow: "0 0 15px rgba(5,3,62,0.5)"
            }}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="w-14 h-14 rounded-full shadow items-center justify-center z-20 transition-all duration-300 hover:scale-110 flex"
            style={{
              backgroundColor: "#05033e",
              color: "white",
              boxShadow: "0 0 15px rgba(5,3,62,0.5)"
            }}
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <p
        className="mt-6 text-center text-sm md:hidden flex items-center justify-center gap-2"
        style={{ color: "#05033e" }}
      >
        Swipe left or right
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </p>

    </section >
  )
}


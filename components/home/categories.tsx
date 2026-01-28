"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Layout,
  Palette,
  Headset,
  TrendingUp,
  Target,
  Wallet,
  ShieldCheck,
  ArrowUpRight
} from "lucide-react"

const categories = [
  {
    title: "Modern Design",
    icon: <Layout className="w-10 h-10" />,
    description: "Sleek, responsive, and user-centric interfaces.",
    color: "from-blue-400 to-blue-600"
  },
  {
    title: "Creative Design",
    icon: <Palette className="w-10 h-10" />,
    description: "Innovative visuals that capture brand identity.",
    color: "from-purple-400 to-purple-600"
  },
  {
    title: "24*7 User Support",
    icon: <Headset className="w-10 h-10" />,
    description: "Round-the-clock assistance for your peace of mind.",
    color: "from-green-400 to-green-600"
  },
  {
    title: "Business Growth",
    icon: <TrendingUp className="w-10 h-10" />,
    description: "Data-driven strategies to scale your operations.",
    color: "from-orange-400 to-orange-600"
  },
  {
    title: "Market Strategy",
    icon: <Target className="w-10 h-10" />,
    description: "Targeted campaigns that maximize ROI.",
    color: "from-red-400 to-red-600"
  },
  {
    title: "Affordable Cost",
    icon: <Wallet className="w-10 h-10" />,
    description: "Premium solutions tailored to your budget.",
    color: "from-teal-400 to-teal-600"
  },
  {
    title: "Safe & Secure",
    icon: <ShieldCheck className="w-10 h-10" />,
    description: "Enterprise-grade security for your data.",
    color: "from-indigo-400 to-indigo-600"
  }
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
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const scroll = (dir: "left" | "right") => {
    if (!slider.current) return
    slider.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth"
    })
  }

  return (
    <section
      ref={sectionRef}
      className="py-24 relative overflow-hidden bg-slate-50"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-100/50 blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-100/50 blur-3xl opacity-60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-wider mb-4 uppercase">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#05033e]">
            Our Key Features
          </h2>
          <p className="max-w-2xl mx-auto text-slate-600 text-base md:text-lg">
            We deliver excellence through innovation, dedication, and a commitment to your success.
            Explore what makes us the preferred choice.
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative group px-4 md:px-12">

          {/* Slider */}
          <div
            ref={slider}
            className="flex gap-6 overflow-x-auto px-4 pb-12 pt-4 snap-x snap-mandatory no-scrollbar"
            style={{ scrollBehavior: 'smooth' }}
          >
            {categories.map((item, i) => (
              <Link
                key={i}
                href="#"
                className={`snap-center shrink-0 w-[300px] md:w-[360px] 
                           transition-all duration-700
                           ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div
                  className="bg-white h-[380px] rounded-2xl p-8
                            flex flex-col items-start justify-center text-left
                            border border-slate-100
                            transition-all duration-300 ease-out
                            hover:-translate-y-2 hover:shadow-xl hover:border-blue-100
                            group/card relative overflow-hidden"
                >
                  {/* Hover Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover/card:opacity-5 transition-opacity duration-300`} />

                  <div className="relative z-10 w-full">
                    <div
                      className="mb-6 w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center
                                text-[#05033e] group-hover/card:scale-110 group-hover/card:bg-[#05033e] group-hover/card:text-white
                                transition-all duration-300 shadow-sm"
                    >
                      {item.icon}
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-slate-800 group-hover/card:text-[#05033e] transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-slate-500 leading-relaxed text-sm md:text-base group-hover/card:text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="hidden md:flex justify-between items-center absolute top-1/2 -translate-y-1/2 left-0 right-0 w-full pointer-events-none px-0">
            <button
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center 
                        text-[#05033e] hover:bg-[#05033e] hover:text-white transition-all duration-300 pointer-events-auto
                        hover:scale-110 -ml-6"
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center 
                        text-[#05033e] hover:bg-[#05033e] hover:text-white transition-all duration-300 pointer-events-auto
                        hover:scale-110 -mr-6"
              aria-label="Scroll right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Swipe Indicator */}
        <div className="flex md:hidden justify-center items-center gap-2 mt-4 text-slate-400 text-sm animate-pulse">
          <ArrowLeft className="w-4 h-4" />
          <span>Swipe to explore</span>
          <ArrowRight className="w-4 h-4" />
        </div>

      </div>
    </section >
  )
}


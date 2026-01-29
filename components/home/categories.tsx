"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle,
  Headset,
  TrendingUp,
  Globe,
  Wallet,
  ShieldCheck,
  ArrowUpRight
} from "lucide-react"

const categories = [
  {
    title: "End-to-End Staffing",
    icon: <Briefcase className="w-10 h-10" />,
    description: "Complete workforce solutions from sourcing to deployment, tailored to your business needs.",
    color: "from-blue-400 to-blue-600"
  },
  {
    title: "Pan-India Presence",
    icon: <Globe className="w-10 h-10" />,
    description: "Extensive network across India connecting talent with opportunities in every major city.",
    color: "from-purple-400 to-purple-600"
  },
  {
    title: "Dedicated Support",
    icon: <Headset className="w-10 h-10" />,
    description: "Our team provides personalized guidance throughout your recruitment journey.",
    color: "from-green-400 to-green-600"
  },
  {
    title: "Skill Development",
    icon: <TrendingUp className="w-10 h-10" />,
    description: "Training and upskilling programs to enhance workforce capabilities and career growth.",
    color: "from-orange-400 to-orange-600"
  },
  {
    title: "Industry Expertise",
    icon: <CheckCircle className="w-10 h-10" />,
    description: "Specialized staffing solutions across manufacturing, retail, logistics, and IT sectors.",
    color: "from-red-400 to-red-600"
  },
  {
    title: "Compliant Solutions",
    icon: <ShieldCheck className="w-10 h-10" />,
    description: "100% statutory compliance ensuring transparent and legally sound employment practices.",
    color: "from-teal-400 to-teal-600"
  },
  {
    title: "Quick Turnaround",
    icon: <Wallet className="w-10 h-10" />,
    description: "Fast and efficient placement process to meet your urgent staffing requirements.",
    color: "from-indigo-400 to-indigo-600"
  }
]

export default function Categories() {
  const [isVisible, setIsVisible] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
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

  // Duplicate categories for seamless infinite loop
  const duplicatedCategories = [...categories, ...categories]

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
          <span className="inline-block text-[#05033e] text-sm font-semibold tracking-wider mb-4 uppercase border-b-2 border-[#05033e] pb-1">
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

        {/* Infinite Marquee Slider */}
        <div className="relative overflow-hidden">
          {/* Gradient Overlays for smooth fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

          {/* Marquee Track - uses marquee-track class from globals.css */}
          <div
            className="marquee-track flex gap-6 pb-8 pt-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          >
            {duplicatedCategories.map((item, i) => (
              <Link
                key={i}
                href="#"
                className={`shrink-0 w-[300px] md:w-[360px] 
                           transition-all duration-700
                           ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
                style={{ transitionDelay: `${(i % categories.length) * 100}ms` }}
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
        </div>

      </div>
    </section>
  )
}


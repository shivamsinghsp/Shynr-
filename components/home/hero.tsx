"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Add your hero images here - these will scroll from right to left
  // Add your hero images here - these will scroll from right to left
  const heroImages = [
    "/hero_corporate_team_new.png",
    "/hero_abstract_network_new.png",
    "/hero_handshake_new.png",
    "/hero_future_office_new.png",
  ]

  return (
    <section className="relative h-[80vh] overflow-hidden">

      {/* Scrolling Background Images Container */}
      <div className="absolute inset-0">
        <div
          className="hero-scroll-container"
          style={{
            display: 'flex',
            width: 'fit-content',
            height: '100%',
            animation: 'scrollLeft 30s linear infinite',
          }}
        >
          {/* First set of images */}
          {heroImages.map((src, index) => (
            <div
              key={`img-${index}`}
              className="hero-image-slide"
              style={{
                minWidth: '100vw',
                height: '100%',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <img
                src={src}
                alt={`Hero slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {heroImages.map((src, index) => (
            <div
              key={`img-dup-${index}`}
              className="hero-image-slide"
              style={{
                minWidth: '100vw',
                height: '100%',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <img
                src={src}
                alt={`Hero slide duplicate ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Gradient overlay with neon accent */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 50%, rgba(5,3,62,0.15) 100%)"
        }}
      />

      {/* Animated neon glow line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 z-[2]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, #05033e 50%, transparent 100%)",
          animation: "pulse 2s ease-in-out infinite",
          boxShadow: "0 0 20px #05033e, 0 0 40px #05033e"
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 items-center">

        <div className="text-white">
          {/* Animated heading */}
          <h1
            className={`text-5xl md:text-6xl font-bold leading-tight max-w-xl transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            Create A Better <br />
            Future For <br />
            <span
              style={{
                color: "#05033e",
                textShadow: "0 0 10px rgba(5,3,62,0.5), 0 0 20px rgba(5,3,62,0.3)"
              }}
            >
              Yourself
            </span>
          </h1>

          {/* Animated paragraph */}
          <p
            className={`mt-6 max-w-md text-gray-300 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            At eu lobortis pretium tincidunt amet lacus ut aenean aliquet.
            Blandit a massa elementum id scelerisque rhoncus...
          </p>

          {/* Animated CTA with neon glow */}
          <Link
            href="/about"
            className={`inline-flex items-center mt-8 px-8 py-3 rounded-md font-semibold
                       transition-all duration-300 delay-500
                       border border-transparent hover:border-[#05033e]
                       bg-[#05033e] text-white hover:bg-black hover:text-[#05033e]
                       hover:shadow-[0_0_25px_rgba(5,3,62,0.6)]
                       shadow-[0_0_15px_rgba(5,3,62,0.4)]
                       ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            Explore More
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>

      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .hero-scroll-container:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}

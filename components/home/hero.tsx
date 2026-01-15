"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Add your hero images here - these will scroll from right to left
  const heroImages = [
    "/1.svg",
    "/2.svg",
    "/3.svg",
    "/4.svg",
    // Add more images as needed, e.g.:
    // "/hero-image-1.jpg",
    // "/hero-image-2.jpg",
    // "/hero-image-3.jpg",
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
              <Image
                src={src}
                alt={`Hero slide ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                priority={index === 0}
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
              <Image
                src={src}
                alt={`Hero slide duplicate ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Gradient overlay with neon accent */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 50%, rgba(57,255,20,0.15) 100%)"
        }}
      />

      {/* Animated neon glow line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 z-[2]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, #39FF14 50%, transparent 100%)",
          animation: "pulse 2s ease-in-out infinite",
          boxShadow: "0 0 20px #39FF14, 0 0 40px #39FF14"
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
                color: "#39FF14",
                textShadow: "0 0 10px rgba(57,255,20,0.5), 0 0 20px rgba(57,255,20,0.3)"
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
                       transition-all duration-500 delay-500
                       hover:scale-105 active:scale-95
                       ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            style={{
              backgroundColor: "#39FF14",
              color: "#0a0a0a",
              boxShadow: "0 0 15px rgba(57,255,20,0.4), 0 0 30px rgba(57,255,20,0.2)",
            }}
          >
            Explore More
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
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

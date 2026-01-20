"use client"

import React, { useState, useEffect } from "react"
import { Phone, Mail, Clock, MapPin } from "lucide-react"

const ContactPage = () => {
  const settings = {
    phone: "0512-4050588",
    email: "info@shynr.in",
    openingHours: "Mon - Fri: 9AM - 6PM",
    officeAddress: "Pan-India Operations"
  }

  const [sent, setSent] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <main className="w-full bg-white">

      {/* Hero */}
      <section
        className="relative min-h-[40vh] md:h-[50vh] flex items-center justify-center text-center px-6 overflow-hidden"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/70 z-10" />
          <img src="/images/contact-hero.png" alt="Contact Hero" className="w-full h-full object-cover" />
        </div>

        {/* Neon Glow Line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 z-[2]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #05033e 50%, transparent 100%)",
            boxShadow: "0 0 20px #05033e, 0 0 40px #05033e"
          }}
        />

        <div className="relative z-10 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Get in <span style={{ color: "#96c2ecff", textShadow: "0 0 20px rgba(5,3,62,0.3)" }}>Touch</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Have questions? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* Left */}
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-6">
            Partner With <span className="text-[#05033e]" style={{ textShadow: "0 2px 10px rgba(5,3,62,0.3)" }}>SHYNR</span>
          </h2>

          <p className="mt-4 text-gray-600 text-lg max-w-lg leading-relaxed">
            Whether you need large-scale manpower or specialized professionals, our team is ready to deliver staffing solutions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-12">
            <Info
              title="Call us"
              value={settings.phone}
              icon={<Phone className="w-8 h-8 text-[#05033e]" />}
            />
            <Info
              title="Email"
              value={settings.email}
              icon={<Mail className="w-8 h-8 text-[#05033e]" />}
            />
            <Info
              title="Hours"
              value={settings.openingHours}
              icon={<Clock className="w-8 h-8 text-[#05033e]" />}
            />
            <Info
              title="Operations"
              value={settings.officeAddress}
              icon={<MapPin className="w-8 h-8 text-[#05033e]" />}
            />
          </div>
        </div>

        {/* Form */}
        <div
          className={`p-10 rounded-3xl shadow-2xl transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            boxShadow: "0 0 40px rgba(5,3,62,0.1)"
          }}
        >
          <h3 className="text-2xl font-bold mb-2 text-card-foreground">Send a message</h3>
          <p className="text-sm text-gray-400 mb-8">
            We'll get back to you within 24 hours
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="First name" />
              <Input placeholder="Last name" />
            </div>

            <Input type="email" placeholder="Email address" />
            <Textarea placeholder="Your message..." />

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 border border-transparent hover:border-[#05033e] bg-[#05033e] text-white hover:bg-black hover:text-white shadow-[0_0_20px_rgba(5,3,62,0.3)] hover:shadow-[0_0_30px_rgba(5,3,62,0.5)]"
            >
              Send Message
            </button>

            {sent && (
              <p className="text-[#05033e] text-sm text-center mt-4 font-semibold">
                Message sent successfully
              </p>
            )}
          </form>
        </div>

      </section>

      {/* Google Map Section */}
      <section className="w-full relative z-10 border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6 h-[550px] md:h-[650px]">
          <div className="w-full h-full rounded-3xl overflow-hidden shadow-lg border border-gray-200 grayscale hover:grayscale-0 transition-all duration-500">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d710.3025256935434!2d80.33639478700282!3d26.477576072980895!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399c389bcaa40e41%3A0xd46dd1b7825522c7!2sRatan%20Esquire!5e0!3m2!1sen!2sin!4v1768822701984!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Shynr Office Location - Ratan Esquire"
            ></iframe>
          </div>
        </div>
      </section>
    </main>
  )
}

/* Components */

const Info = ({ title, value, icon }: any) => (
  <div className="flex flex-col gap-2 p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="mb-4 p-3 bg-gray-50 rounded-full w-fit group-hover:bg-[#e6e6fa] transition-colors duration-300">
      {icon}
    </div>
    <h4 className="font-bold text-[#05033e] text-lg">{title}</h4>
    <p className="text-gray-600 font-medium group-hover:text-[#05033e] transition-colors">{value}</p>
  </div>
)

const Input = ({ type = "text", placeholder }: any) => (
  <input
    type={type}
    placeholder={placeholder}
    required
    className="w-full p-4 rounded-xl bg-gray-50 text-foreground border border-transparent focus:bg-white focus:border-[#05033e] focus:ring-4 focus:ring-[#05033e]/10 focus:outline-none transition-all duration-300 placeholder:text-gray-400 font-medium"
  />
)

const Textarea = ({ placeholder }: any) => (
  <textarea
    placeholder={placeholder}
    required
    rows={5}
    className="w-full p-4 rounded-xl bg-gray-50 text-foreground border border-transparent focus:bg-white focus:border-[#05033e] focus:ring-4 focus:ring-[#05033e]/10 focus:outline-none resize-none transition-all duration-300 placeholder:text-gray-400 font-medium"
  />
)

export default ContactPage

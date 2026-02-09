"use client"

import React, { useState, useEffect } from "react"
import { Phone, Mail, Clock, MapPin, Loader2 } from "lucide-react"

interface FormData {
  firstName: string
  lastName: string
  email: string
  message: string
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  message: ""
}

const ContactPage = () => {
  const settings = {
    phone: "0612-7180789",
    email: "info@shynr.in",
    openingHours: "Mon - Fri: 9AM - 6PM",
    officeAddress: "Pan-India Operations"
  }

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMessage("")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus("success")
        setFormData(initialFormData) // Reset form
        setTimeout(() => setStatus("idle"), 5000)
      } else {
        setStatus("error")
        setErrorMessage(data.error || "Failed to send message. Please try again.")
        setTimeout(() => setStatus("idle"), 5000)
      }
    } catch {
      setStatus("error")
      setErrorMessage("Network error. Please check your connection and try again.")
      setTimeout(() => setStatus("idle"), 5000)
    }
  }

  const [locations, setLocations] = useState([
    {
      id: 1,
      title: "D. N. D. Library",
      address: "Kanpur, Uttar Pradesh",
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3574.0564919972394!2d80.40703617487699!3d26.389362482386392!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399c4177ca1f734d%3A0x88f1244f0ba283d6!2sD.%20N.%20D.%20Library!5e0!3m2!1sen!2sin!4v1770442725056!5m2!1sen!2sin"
    },
    {
      id: 2,
      title: "CSJM University",
      address: "Kanpur, Uttar Pradesh",
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3570.720984389039!2d80.26173997872911!3d26.49692711828861!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399c37ea522f9c0d%3A0xc0670941a068aea2!2sChhatrapati%20Shahu%20Ji%20Maharaj%20University%2C%20Kanpur!5e0!3m2!1sen!2sin!4v1770442892535!5m2!1sen!2sin"
    },
    {
      id: 3,
      title: "Kalpana Plaza",
      address: "Kanpur, Uttar Pradesh",
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3571.698245297599!2d80.35524577487958!3d26.465454079169326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399c47e159154111%3A0xe5a9d01e3e06012e!2sKalpana%20Plaza!5e0!3m2!1sen!2sin!4v1770442946471!5m2!1sen!2sin"
    },
    {
      id: 4,
      title: "Millenium Business Park",
      address: "Navi Mumbai, Maharashtra",
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.957552601997!2d73.01590922466599!3d19.10951800092055!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c0e7e7a71499%3A0x98d8b38ca6db76be!2sMillenium%20Business%20Park%2C%20MIDC%20Industrial%20Area%2C%20Sector%201%2C%20Kopar%20Khairane%2C%20Navi%20Mumbai%2C%20Maharashtra%20400710!5e0!3m2!1sen!2sin!4v1770446734442!5m2!1sen!2sin"
    }
  ])

  const [activeMap, setActiveMap] = useState<typeof locations[0] | null>(null)

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
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First name"
                required
                className="w-full p-4 rounded-xl bg-gray-50 text-foreground border border-transparent focus:bg-white focus:border-[#05033e] focus:ring-4 focus:ring-[#05033e]/10 focus:outline-none transition-all duration-300 placeholder:text-gray-400 font-medium"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last name"
                required
                className="w-full p-4 rounded-xl bg-gray-50 text-foreground border border-transparent focus:bg-white focus:border-[#05033e] focus:ring-4 focus:ring-[#05033e]/10 focus:outline-none transition-all duration-300 placeholder:text-gray-400 font-medium"
              />
            </div>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email address"
              required
              className="w-full p-4 rounded-xl bg-gray-50 text-foreground border border-transparent focus:bg-white focus:border-[#05033e] focus:ring-4 focus:ring-[#05033e]/10 focus:outline-none transition-all duration-300 placeholder:text-gray-400 font-medium"
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Your message..."
              required
              rows={5}
              className="w-full p-4 rounded-xl bg-gray-50 text-foreground border border-transparent focus:bg-white focus:border-[#05033e] focus:ring-4 focus:ring-[#05033e]/10 focus:outline-none resize-none transition-all duration-300 placeholder:text-gray-400 font-medium"
            />

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 border border-transparent hover:border-[#05033e] bg-[#05033e] text-white hover:bg-black hover:text-white shadow-[0_0_20px_rgba(5,3,62,0.3)] hover:shadow-[0_0_30px_rgba(5,3,62,0.5)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </button>

            {status === "success" && (
              <p className="text-green-600 text-sm text-center mt-4 font-semibold">
                ✓ Message sent successfully! We'll get back to you soon.
              </p>
            )}

            {status === "error" && (
              <p className="text-red-600 text-sm text-center mt-4 font-semibold">
                ✕ {errorMessage}
              </p>
            )}
          </form>
        </div>

      </section>

      {/* Our Locations */}
      <section className="w-full relative z-10 border-t border-gray-100 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-[#05033e] mb-4">Our Locations</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Find us at these strategic locations across India</p>
          </div>

          <div className="flex flex-col gap-6">

            {/* Hero Map (Top) - Click to Expand */}
            <div
              className="w-full h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden shadow-2xl relative group cursor-pointer border-4 border-white"
              onClick={() => setActiveMap(locations[0])}
            >
              <div className="absolute top-6 left-6 z-20 bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg">
                <h3 className="font-bold text-[#05033e] text-xl flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-[#05033e]" />
                  {locations[0].title}
                </h3>
                <p className="text-gray-500 text-sm mt-1 ml-8">{locations[0].address}</p>
              </div>

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none z-10" />
              <div className="absolute bottom-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
                <div className="bg-white text-[#05033e] px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                  Expand Map
                </div>
              </div>

              <iframe
                src={locations[0].embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, pointerEvents: "none" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${locations[0].title} Map`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Thumbnail Maps (Bottom) - Click to Swap */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {locations.slice(1).map((location, index) => (
                <div
                  key={location.id}
                  onClick={() => {
                    const newLocations = [...locations];
                    // Swap index 0 with (index + 1)
                    const temp = newLocations[0];
                    newLocations[0] = newLocations[index + 1];
                    newLocations[index + 1] = temp;
                    setLocations(newLocations);
                  }}
                  className="h-[200px] rounded-[2rem] overflow-hidden shadow-lg relative cursor-pointer group border-2 border-white hover:border-[#05033e]/20 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm">
                    <h3 className="font-bold text-[#05033e] text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {location.title}
                    </h3>
                  </div>

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-10" />

                  <iframe
                    src={location.embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, pointerEvents: "none" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${location.title} Map`}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Map Modal */}
      {activeMap && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={() => setActiveMap(null)}
        >
          <div
            className="bg-white w-full max-w-6xl h-[80vh] rounded-[2rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveMap(null)}
              className="absolute top-6 right-6 z-10 bg-white hover:bg-gray-100 text-black p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="w-full h-full relative">
              <iframe
                src={activeMap.embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${activeMap.title} Full Map`}
              />
              <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-md px-8 py-6 rounded-3xl shadow-2xl max-w-md">
                <h3 className="font-bold text-2xl text-[#05033e] mb-2">{activeMap.title}</h3>
                <p className="text-gray-600 text-lg">{activeMap.address}</p>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default ContactPage

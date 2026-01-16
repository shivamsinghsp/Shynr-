"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, ChevronDown, Download, Mail, Phone, Globe, ChevronLeft, ChevronRight } from "lucide-react"

// Mock Data for Press Coverage
const pressReleases = [
    {
        id: 1,
        date: "December 05, 2025",
        year: "2025",
        title: "SHYNR Elevates New Leadership to Drive Pan-India Expansion",
        location: "Bengaluru",
        link: "#"
    },
    {
        id: 2,
        date: "October 29, 2025",
        year: "2025",
        title: "SHYNR Reports 40% Growth in Q2 FY26",
        location: "Bengaluru",
        link: "#"
    },
    {
        id: 3,
        date: "July 28, 2025",
        year: "2025",
        title: "SHYNR Partners with Major Tech Giants for Workforce Solutions",
        location: "Bengaluru",
        link: "#"
    },
    {
        id: 4,
        date: "May 05, 2025",
        year: "2025",
        title: "SHYNR Launches New Digital Platform for Gig Workers",
        location: "Bengaluru",
        link: "#"
    },
    {
        id: 5,
        date: "October 28, 2024",
        year: "2024",
        title: "SHYNR Q2 FY25 Results: Stable Growth Amidst Market Volatility",
        location: "Bengaluru",
        link: "#"
    },
    {
        id: 6,
        date: "July 09, 2024",
        year: "2024",
        title: "New Strategic Partnership Announced with SkillIndia",
        location: "Delhi",
        link: "#"
    },
    {
        id: 7,
        date: "February 16, 2024",
        year: "2024",
        title: "SHYNR Expands Operations into Manufacturing Sector",
        location: "Pune",
        link: "#"
    },
    {
        id: 8,
        date: "November 10, 2023",
        year: "2023",
        title: "SHYNR Foundation Launched to Upskill Rural Youth",
        location: "Kanpur",
        link: "#"
    },
    {
        id: 9,
        date: "August 15, 2023",
        year: "2023",
        title: "Celebrating Independence Day with 10k New Hires",
        location: "Mumbai",
        link: "#"
    },
    {
        id: 10,
        date: "January 10, 2023",
        year: "2023",
        title: "SHYNR Recognized as Top Employer of the Year",
        location: "Bengaluru",
        link: "#"
    }
]

// Extract unique years and sort descending
const years = Array.from(new Set(pressReleases.map(item => item.year))).sort((a, b) => Number(b) - Number(a))

export default function MediaPage() {
    const [activeTab, setActiveTab] = useState<"press" | "contact">("press")
    const [selectedYear, setSelectedYear] = useState<string>("All")
    const [isVisible, setIsVisible] = useState(false)

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 6

    useEffect(() => {
        setIsVisible(true)
    }, [])

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [selectedYear])

    // Filter Logic
    const filteredNews = pressReleases.filter(item =>
        selectedYear === "All" || item.year === selectedYear
    )

    // Pagination Logic
    const totalPages = Math.ceil(filteredNews.length / itemsPerPage)
    const currentNews = filteredNews.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    return (
        <main className="bg-white overflow-x-hidden min-h-screen">

            {/* HERO SECTION */}
            <section
                className="relative min-h-[50vh] md:h-[60vh] flex items-center justify-center text-center px-6 overflow-hidden"
            >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/70 z-10" />
                    <img src="/images/media-hero.png" alt="Media Hero" className="w-full h-full object-cover" />
                </div>

                {/* Neon Glow Line */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-1 z-[2]"
                    style={{
                        background: "linear-gradient(90deg, transparent 0%, #05033e 50%, transparent 100%)",
                        boxShadow: "0 0 20px #05033e, 0 0 40px #05033e"
                    }}
                />

                <div className={`relative z-10 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                    <h1 className="text-white text-4xl md:text-6xl font-bold mb-4">
                        Media <span style={{ color: "#05033e", textShadow: "0 0 20px rgba(5,3,62,0.3)" }}>Centre</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Latest updates, press releases, and media resources from SHYNR
                    </p>
                </div>
            </section>

            {/* TABS NAVIGATION */}
            <section className="py-12 border-b border-gray-100 sticky top-[80px] bg-white/90 backdrop-blur-md z-40 transition-all duration-500">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex justify-center gap-4 bg-gray-100 p-2 rounded-2xl w-fit mx-auto shadow-inner">
                        <button
                            onClick={() => setActiveTab("press")}
                            className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === "press"
                                ? "bg-[#0a0a0a] text-white shadow-lg scale-105"
                                : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            Press Coverage
                        </button>
                        <button
                            onClick={() => setActiveTab("contact")}
                            className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === "contact"
                                ? "bg-[#0a0a0a] text-white shadow-lg scale-105"
                                : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            Media Contact
                        </button>
                    </div>
                </div>
            </section>

            {/* CONTENT AREA */}
            <section className="py-16 min-h-[600px] bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">

                    {/* PRESS COVERAGE TAB */}
                    {activeTab === "press" && (
                        <div className="animate-fadeIn">

                            {/* Filter Header */}
                            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                                <h2 className="text-3xl font-bold text-[#0a0a0a]">
                                    Press Releases
                                </h2>

                                <div className="flex items-center gap-3">
                                    <label className="text-gray-600 font-medium">Select Year:</label>
                                    <div className="relative group">
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(e.target.value)}
                                            className="appearance-none bg-white border border-gray-300 text-gray-900 font-bold py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-[#05033e] focus:ring-1 focus:ring-[#05033e] cursor-pointer shadow-sm hover:border-[#05033e] transition-all"
                                        >
                                            {years.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                            <option value="All">All Years</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none group-hover:text-[#05033e] transition-colors" />
                                    </div>
                                </div>
                            </div>

                            {/* News Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {currentNews.length > 0 ? (
                                    currentNews.map((news, index) => (
                                        <div
                                            key={news.id}
                                            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-2xl border-l-4 border-[#05033e] transition-all duration-500 group opacity-0 animate-slideUp"
                                            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                                        >
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 font-semibold">
                                                <span className="text-[#0a0a0a]">{news.location},</span>
                                                <span>{news.date}</span>
                                            </div>

                                            <h3 className="text-xl font-bold text-[#0a0a0a] mb-4 group-hover:text-teal-700 transition-colors leading-snug">
                                                <Link href={news.link} className="hover:underline">
                                                    {news.title}
                                                </Link>
                                            </h3>

                                            <Link
                                                href={news.link}
                                                className="inline-flex items-center text-sm font-bold text-[#05033e] group-hover:translate-x-2 transition-transform duration-300"
                                                style={{ textShadow: "0 0 1px rgba(0,0,0,0.1)" }}
                                            >
                                                Read More →
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-20 text-gray-500 text-xl font-medium">
                                        No press releases found for {selectedYear}.
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-16 animate-fadeIn delay-500">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-full border border-gray-300 hover:border-[#05033e] hover:bg-[#05033e] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-gray-300 transition-all duration-300"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>

                                    <span className="font-bold text-gray-600">
                                        Page <span className="text-[#0a0a0a] text-lg">{currentPage}</span> of {totalPages}
                                    </span>

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-full border border-gray-300 hover:border-[#05033e] hover:bg-[#05033e] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-gray-300 transition-all duration-300"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}


                    {/* MEDIA CONTACT TAB */}
                    {activeTab === "contact" && (
                        <div className="animate-fadeIn max-w-4xl mx-auto">
                            <div className="bg-white rounded-3xl p-10 md:p-16 shadow-2xl text-center border border-gray-100 hover:shadow-[0_0_40px_rgba(0,0,0,0.1)] transition-shadow duration-500">
                                <div className="w-24 h-24 bg-[#ffffffff] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg animate-bounce-slow">
                                    <Mail className="w-10 h-10 text-[#05033e]" />
                                </div>

                                <h2 className="text-3xl md:text-4xl font-bold text-[#0a0a0a] mb-6">
                                    Media Inquiries
                                </h2>

                                <p className="text-gray-600 text-lg mb-10 leading-relaxed max-w-lg mx-auto">
                                    For press kits, interview requests, or any media-related queries,
                                    please contact our communications team.
                                </p>

                                <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                                    <div className="p-8 bg-white rounded-3xl shadow-lg border border-gray-100 hover:bg-[#05033e] hover:border-[#05033e] transition-all duration-300 group cursor-pointer hover:-translate-y-2">
                                        <Mail className="w-10 h-10 text-[#05033e] group-hover:text-white mx-auto mb-6 transition-colors" />
                                        <h3 className="font-bold text-xl mb-2 text-[#0a0a0a] group-hover:text-white">Email Us</h3>
                                        <Link href="mailto:info@shynr.in" className="text-lg text-[#05033e] font-semibold group-hover:text-white">
                                            info@shynr.in
                                        </Link>
                                    </div>

                                    <div className="p-8 bg-white rounded-3xl shadow-lg border border-gray-100 hover:bg-[#05033e] hover:border-[#05033e] transition-all duration-300 group cursor-pointer hover:-translate-y-2">
                                        <Phone className="w-10 h-10 text-[#05033e] group-hover:text-white mx-auto mb-6 transition-colors" />
                                        <h3 className="font-bold text-xl mb-2 text-[#0a0a0a] group-hover:text-white">Call Us</h3>
                                        <Link href="tel:05124050588" className="text-lg text-[#05033e] font-semibold group-hover:text-white">
                                            0512-4050588
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>

        </main>
    )
}

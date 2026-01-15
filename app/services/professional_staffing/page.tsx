"use client"

import { useState, useEffect } from "react"
import { Users, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

type TabKey = "it-staffing" | "recruitment" | "international"

interface TabData {
    title: string
    description: string
    showServices: boolean
}

const tabContent: Record<TabKey, TabData> = {
    "it-staffing": {
        title: "Strategic Staffing Solutions",
        description:
            "SHYNR's strategic staffing services enable organizations to scale their workforce with agility and precision. We specialize in identifying mid-to-senior level talent across diverse verticals, ensuring you have the right expertise to drive business objectives. Our approach focuses on domain knowledge, cultural fit, and long-term value creation.",
        showServices: true,
    },
    recruitment: {
        title: "Executive & Leadership Search",
        description:
            "Our executive search practice is dedicated to finding visionary leaders who can steer your organization towards growth. Leverading deep market intelligence and a vast network of industry veterans, SHYNR connects you with top-tier executives capable of transforming business outcomes and driving innovation.",
        showServices: false,
    },
    international: {
        title: "Niche & Project-Based Hiring",
        description:
            "For specialized projects and niche skill requirements, SHYNR offers targeted hiring solutions. Whether it's for a digital transformation initiative or a short-term specialized mandate, we deliver ready-to-deploy professionals who can hit the ground running and deliver immediate impact.",
        showServices: false,
    },
}

export default function ProfessionalStaffing() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabKey>("it-staffing")
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
    }, [])

    const currentTab = tabContent[activeTab]

    return (
        <main className="bg-white overflow-x-hidden">

            {/* HERO SECTION */}
            <section
                className="relative min-h-[50vh] md:h-[60vh] flex items-center justify-center text-center px-6 overflow-hidden"
            >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/70 z-10" />
                    <img src="/images/tech-office.png" alt="Professional Staffing Hero" className="w-full h-full object-cover" />
                </div>

                {/* Neon Glow Line */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-1 z-[2]"
                    style={{
                        background: "linear-gradient(90deg, transparent 0%, #39FF14 50%, transparent 100%)",
                        boxShadow: "0 0 20px #39FF14, 0 0 40px #39FF14"
                    }}
                />

                <div className={`relative z-10 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                    <h1 className="text-white text-4xl md:text-6xl font-bold mb-4">
                        Professional <span style={{ color: "#39FF14", textShadow: "0 0 20px rgba(57,255,20,0.3)" }}>Staffing</span>
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg">
                        Expertise that drives business transformation
                    </p>
                </div>
            </section>

            {/* INTRO GRID */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

                    {/* Left Text */}
                    <div
                        className={`space-y-6 transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
                    >
                        <h2 className="text-3xl font-bold text-[#0a0a0a]">
                            Building Key <span style={{ color: "#39FF14" }}>Capabilities</span>
                        </h2>
                        <p className="text-gray-700 text-lg leading-relaxed border-l-4 border-[#39FF14] pl-6 py-2 bg-gray-50 rounded-r-xl">
                            SHYNR Private Limited offers Professional Staffing solutions for organizations seeking experienced, skilled, and domain-specific professionals. Our consultative hiring approach helps clients acquire talent that drives performance, innovation, and long-term value.
                        </p>
                        <ul className="space-y-4 pt-4">
                            {['IT Staffing', 'Executive Search', 'Niche Skills'].map(item => (
                                <li key={item} className="flex items-center gap-3 font-semibold text-gray-800">
                                    <div className="w-2 h-2 rounded-full bg-[#39FF14]" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right Image */}
                    <div
                        className={`relative rounded-3xl overflow-hidden shadow-2xl h-[400px] group transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
                    >
                        {/* Header Image: Generated by AI (saved as /public/images/tech-office.png) */}
                        <div className="absolute inset-0 bg-[#0a0a0a]/10 group-hover:bg-transparent transition-colors z-10" />
                        <img
                            src="/images/tech-office.png"
                            alt="Professional Staffing Office"
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                    </div>

                </div>
            </section>

            {/* TAB NAVIGATION */}
            <section className="py-6">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-center gap-4">
                        {[
                            { key: "it-staffing", label: "Strategic Staffing" },
                            { key: "recruitment", label: "Executive Search" },
                            { key: "international", label: "Niche Hiring" }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as TabKey)}
                                className="flex-1 transition-all duration-300 transform hover:scale-105"
                                style={{
                                    padding: "16px 24px",
                                    fontSize: "16px",
                                    fontWeight: 700,
                                    backgroundColor: activeTab === tab.key ? "#39FF14" : "#111",
                                    color: activeTab === tab.key ? "#0a0a0a" : "#fff",
                                    border: activeTab === tab.key ? "none" : "1px solid #333",
                                    borderRadius: "12px",
                                    boxShadow: activeTab === tab.key ? "0 0 20px rgba(57,255,20,0.4)" : "none",
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* TAB CONTENT */}
            <section className="py-12 bg-gray-50 mt-8">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0a0a0a] mb-6 animate-fadeIn">
                        {currentTab.title}
                    </h2>
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-4xl mx-auto animate-fadeIn">
                        {currentTab.description}
                    </p>
                </div>
            </section>

            {/* SERVICES SECTION - Only for IT Staffing */}
            {currentTab.showServices && (
                <section className="py-16">
                    <h3 className="text-2xl sm:text-3xl font-bold text-center text-[#0a0a0a] mb-12">
                        Key Services
                    </h3>

                    <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Staffing Services Card */}
                        <div
                            className={`group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-[#39FF14] transition-all duration-700 hover:-translate-y-2 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
                            style={{ transitionDelay: "200ms" }}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div
                                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors group-hover:bg-[#39FF14]"
                                    style={{ backgroundColor: "#111", color: "#fff" }}
                                >
                                    <Users className="w-10 h-10 group-hover:text-black transition-colors" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-3">
                                    Staffing Services
                                </h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Comprehensive IT staffing solutions across industry verticals.
                                </p>
                            </div>
                        </div>

                        {/* Managed Solutions Card */}
                        <div
                            className={`group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-[#39FF14] transition-all duration-700 hover:-translate-y-2 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
                            style={{ transitionDelay: "400ms" }}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div
                                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors group-hover:bg-[#39FF14]"
                                    style={{ backgroundColor: "#111", color: "#fff" }}
                                >
                                    <Settings className="w-10 h-10 group-hover:text-black transition-colors" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-3">
                                    Managed Solutions
                                </h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Managing specific business functions to improve operational efficiency.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA BUTTON */}
            <section className="py-20 text-center bg-[#0a0a0a]">
                <h2 className="text-3xl font-bold text-white mb-8">Ready to transform your workforce?</h2>
                <button
                    onClick={() => router.push("/contactUs")}
                    className="inline-block px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105"
                    style={{
                        backgroundColor: "#39FF14",
                        color: "#0a0a0a",
                        boxShadow: "0 0 20px rgba(57,255,20,0.4)"
                    }}
                >
                    Partner With SHYNR
                </button>
            </section>

        </main>
    )
}

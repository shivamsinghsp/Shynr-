"use client"

import Link from "next/link"

// Reusable Partners Marquee component for use across different pages
export default function PartnersMarquee() {
    // SHYNR's trusted partner companies
    const partners = [
        { name: "Jana Small Finance Bank", logo: "/Jana Small Finance Bank Logo.png", url: "https://www.janabank.com/" },
        { name: "Axis Max Life Insurance", logo: "/home/axis-bank.png", url: "https://www.axisbank.com/" },
        { name: "Lenskart", logo: "/home/Lenskart.png", url: "https://www.lenskart.com/" },
        { name: "JustDial", logo: "/home/justdial.png", url: "https://www.justdial.com/" },
        { name: "Digitide", logo: "/home/DIGITIDE.jpg", url: "https://www.digitidesolutions.com/" },
        { name: "Paytm", logo: "/home/Paytm.png", url: "https://paytm.com/" },
        { name: "Vaco Binary Semantics", logo: "/home/vaco.jpg", url: "https://vacobinarysemantics.com/" },
        { name: "L&T Finance", logo: "/home/L&T_Finance.png", url: "https://www.ltfs.com/" },
        { name: "HDB Finance", logo: "/home/HDB_Finance.png", url: "https://www.hdbfs.com/" },
    ]

    return (
        <section className="py-12 overflow-hidden relative bg-white">
            {/* Section Header */}
            <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
                <p className="text-[#05033e] font-semibold text-lg mb-2">Trusted By Industry Leaders</p>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    Companies We <span style={{ color: "#05033e" }}>Partner With</span>
                </h3>
            </div>

            {/* Marquee */}
            <div className="relative w-full">
                {/* Gradient edges for fade */}
                <div
                    className="absolute left-0 top-0 h-full w-24 z-10"
                    style={{ background: "linear-gradient(to right, white, transparent)" }}
                />
                <div
                    className="absolute right-0 top-0 h-full w-24 z-10"
                    style={{ background: "linear-gradient(to left, white, transparent)" }}
                />

                {/* Marquee Track */}
                <div className="marquee-track gap-16 px-8">
                    {[...partners, ...partners].map((partner, index) => (
                        <Link
                            href={partner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={index}
                            className="group relative h-28 min-w-[140px] flex-shrink-0 flex items-center justify-center px-4 transition-all duration-300"
                        >
                            <img
                                src={partner.logo}
                                alt={partner.name}
                                className="w-36 h-36 object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

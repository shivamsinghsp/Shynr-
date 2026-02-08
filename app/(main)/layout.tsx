import TopBar from "@/components/layout/Topbar"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import FloatingCallButton from "@/components/shared/FloatingCallButton"

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>

            <div className="sticky top-0 z-[100] w-full flex flex-col">
                {/* Sales Overview Marquee */}
                <div className="bg-[#05033e] text-white overflow-hidden py-2 relative z-50">
                    <div className="marquee-track whitespace-nowrap flex items-center">
                        <span className="mx-4 text-sm font-medium">Sales Overview: 🚀 Q1 Hiring Spree is ON! Apply now to secure your spot.</span>
                        <span className="mx-4 text-sm font-medium">•</span>
                        <span className="mx-4 text-sm font-medium">📈 500+ Companies hiring this week.</span>
                        <span className="mx-4 text-sm font-medium">•</span>
                        <span className="mx-4 text-sm font-medium">💼 New positions added daily.</span>
                        <a href="https://cms.com" target="_blank" rel="noopener noreferrer" className="mx-4 inline-flex items-center hover:opacity-80 transition-opacity">
                            <img src="/home/CMS.png" alt="CMS" className="h-5 w-auto object-contain bg-white rounded-sm px-1" />
                        </a>

                        {/* Duplicate for seamless loop */}
                        <span className="mx-4 text-sm font-medium">Sales Overview: 🚀 Q1 Hiring Spree is ON! Apply now to secure your spot.</span>
                        <span className="mx-4 text-sm font-medium">•</span>
                        <span className="mx-4 text-sm font-medium">📈 500+ Companies hiring this week.</span>
                        <span className="mx-4 text-sm font-medium">•</span>
                        <span className="mx-4 text-sm font-medium">💼 New positions added daily.</span>
                        <a href="https://cms.com" target="_blank" rel="noopener noreferrer" className="mx-4 inline-flex items-center hover:opacity-80 transition-opacity">
                            <img src="/home/CMS.png" alt="CMS" className="h-5 w-auto object-contain bg-white rounded-sm px-1" />
                        </a>
                    </div>
                </div>

                <TopBar />
                <Navbar />
            </div>

            <main className="min-h-screen">
                {children}
            </main>

            <FloatingCallButton />
            <Footer />
        </>
    )
}

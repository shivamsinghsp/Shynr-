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
            <TopBar />
            <Navbar />

            <main className="min-h-screen">
                {children}
            </main>

            <FloatingCallButton />
            <Footer />
        </>
    )
}

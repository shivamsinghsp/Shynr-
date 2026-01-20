"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ComingSoon from "@/components/shared/ComingSoon"

function ComingSoonContent() {
    const searchParams = useSearchParams()
    const title = searchParams.get("title") || "This Section"

    return <ComingSoon pageName={title} />
}

export default function ComingSoonPage() {
    return (
        <Suspense fallback={<ComingSoon pageName="Loading..." />}>
            <ComingSoonContent />
        </Suspense>
    )
}

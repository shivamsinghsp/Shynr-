import Link from "next/link"

export default function TopBar() {
  return (
    <div className="bg-[#0a0a0a] text-white text-sm border-b border-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-2 flex justify-end">

        <div className="flex items-center gap-6 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
          <Link
            href="tel:05124050588"
            className="flex items-center gap-2 hover:text-[#39FF14] transition-colors duration-300"
          >
            📞 0512-4050588
          </Link>

          <Link
            href="mailto:info@shynr.in"
            className="flex items-center gap-2 hover:text-[#39FF14] transition-colors duration-300"
          >
            ✉ info@shynr.in
          </Link>
        </div>

      </div>
    </div>
  )
}

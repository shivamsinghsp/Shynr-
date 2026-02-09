import Link from "next/link"
import { Phone, Mail } from "lucide-react"

export default function TopBar() {
  return (
    <div className="bg-[#96c2ecff] text-white text-sm border-b border-neutral-300 shadow-sm relative z-[40]">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex justify-end">

        <div className="flex items-center gap-6 md:gap-8 flex-wrap justify-center sm:justify-end w-full sm:w-auto font-medium">
          <Link
            href="tel:06127180789"
            className="flex items-center gap-2 hover:text-[#05033e] transition-all duration-300 group"
          >
            <Phone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span>0612-7180789</span>
          </Link>

          <Link
            href="mailto:info@shynr.in"
            className="flex items-center gap-2 hover:text-[#05033e] transition-all duration-300 group"
          >
            <Mail className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span>info@shynr.in</span>
          </Link>
        </div>

      </div>
    </div>
  )
}

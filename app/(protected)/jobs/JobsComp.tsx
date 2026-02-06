"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Card,
} from "@/components/ui/card";
import {
  Bookmark,
  BriefcaseBusiness,
  Clock,
  Wallet,
  MapPin,
} from "lucide-react";

// Job interface matching API response
interface Job {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  category: string;
  type: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  description?: string;
  shortDescription?: string;
  skills?: string[];
  featured?: boolean;
  urgent?: boolean;
}

// Helper function to format salary
const formatSalary = (salary: Job['salary']) => {
  if (!salary) return 'Competitive';
  const min = (salary.min / 1000).toFixed(0);
  const max = (salary.max / 1000).toFixed(0);
  return `${min}k - ${max}k`;
};

const JobsComp = ({ job }: { job: Job }) => {
  if (!job) return null;

  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <Card className="bg-[#D3E9FD] transition-all duration-300 border-none shadow-md rounded-2xl overflow-hidden group">
      <div className="p-8 md:p-10">

        {/* Top Header: Badge & Bookmark */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-2">
            {job.featured && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                Featured
              </span>
            )}
            {job.urgent && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                Urgent
              </span>
            )}
            <span className="bg-[#05033e]/10 text-[#05033e] px-4 py-1.5 rounded-full text-sm font-semibold">
              New
            </span>
          </div>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`transition-colors p-2 rounded-full hover:bg-[#05033e]/5 ${isBookmarked ? 'text-[#05033e]' : 'text-gray-400 hover:text-[#05033e]'}`}
          >
            <Bookmark size={28} className={isBookmarked ? "fill-current" : ""} />
          </button>
        </div>

        {/* Company Info */}
        <div className="flex items-start gap-6 mb-8">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.company} className="w-16 h-16 rounded-xl object-contain bg-white p-2 shadow-sm" />
          ) : (
            <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-[#05033e] to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {job.company.charAt(0)}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-2xl font-bold text-[#05033e] mb-2 group-hover:text-blue-700 transition-colors">
              {job.title}
            </h3>
            <p className="text-gray-600 font-medium text-lg">{job.company}</p>
          </div>
        </div>

        {/* Details & Action Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-6 border-t border-[#05033e]/10 mt-6 md:mt-0 md:border-none md:pt-0">
          <div className="flex flex-wrap items-center gap-6 md:gap-8 text-gray-600 font-medium w-full lg:w-auto">
            <div className="flex items-center gap-2.5 min-w-[120px]">
              <BriefcaseBusiness size={20} className="text-[#05033e]" />
              <span className="truncate max-w-[140px] text-base">{job.category}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock size={20} className="text-[#05033e]" />
              <span className="truncate text-base">{job.type}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Wallet size={20} className="text-[#05033e]" />
              <span className="truncate text-base">{formatSalary(job.salary)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin size={20} className="text-[#05033e]" />
              <span className="truncate text-base">{job.location}</span>
            </div>
          </div>

          <div className="w-full lg:w-auto flex justify-end">
            <Link href={`/jobs/${job._id}`} className="w-full lg:w-auto">
              <button className="w-full lg:w-[140px] lg:h-[48px] bg-[#05033e] text-white px-6 py-3 rounded-xl text-base font-bold hover:bg-[#020120] transition-colors shadow-lg hover:shadow-xl transform active:scale-95 whitespace-nowrap overflow-hidden text-ellipsis">
                Job Details
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default JobsComp;


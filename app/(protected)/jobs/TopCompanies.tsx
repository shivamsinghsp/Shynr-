import {
    Sprout,
    Hotel,
    Camera,
    Laptop,
} from "lucide-react";

interface Job {
    category: string;
    [key: string]: any;
}

const TopCompanies = ({ jobs = [] }: { jobs?: Job[] }) => {
    if (!jobs.length) return null;

    const categoryMap = jobs.reduce((acc: Record<string, number>, job) => {
        acc[job.category] = (acc[job.category] || 0) + 1;
        return acc;
    }, {});

    const iconMap: Record<string, any> = {
        "Agriculture": Sprout,
        "Hotel & Tourism": Hotel,
        "Hotels & Tourism": Hotel,
        "Photography": Camera,
        "Development": Laptop,
    };

    return (
        <div className="w-full bg-[#D3E9FD] px-4 py-20">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-[#05033e] mb-4">Top Company</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">At eu lobortis pretium tincidunt amet lacus ut aenean aliquet. Blandit a massa elementum</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {Object.entries(categoryMap).map(([category, count]) => {
                        const Icon = iconMap[category] || Laptop;
                        return (
                            <div
                                key={category}
                                className="flex flex-col items-center justify-between text-center bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full min-h-[320px]"
                            >
                                <div>
                                    <div className="w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center mx-auto mb-6">
                                        <Icon size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-[#05033e] mb-3">{category}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                        Et odio sem tellus ultrices posuere consequat. Tristique nascetur sapien
                                    </p>
                                </div>

                                <span className="inline-block px-4 py-1.5 bg-[#EBF5F4] text-[#056066] text-xs font-semibold rounded-full">
                                    {count} open jobs
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TopCompanies;

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/db';
import Job from '@/db/models/Job';

const sampleJobs = [
    {
        title: "Senior Software Engineer",
        company: "TechCorp Solutions",
        companyLogo: "/logos/techcorp.png",
        location: "San Francisco, CA",
        locationType: "hybrid",
        category: "Development",
        type: "Full Time",
        experienceLevel: "senior",
        salary: { min: 150000, max: 200000, currency: "USD", period: "yearly" },
        description: "We are looking for a Senior Software Engineer to join our growing team. You will be responsible for designing and implementing scalable backend systems, mentoring junior developers, and collaborating with cross-functional teams.",
        shortDescription: "Join our team to build scalable backend systems and mentor developers.",
        responsibilities: [
            "Design and implement scalable microservices architecture",
            "Lead code reviews and establish best practices",
            "Mentor junior and mid-level engineers",
            "Collaborate with product and design teams",
            "Drive technical decisions and architecture discussions"
        ],
        requirements: [
            "7+ years of software development experience",
            "Strong proficiency in Node.js, Python, or Go",
            "Experience with cloud platforms (AWS, GCP, or Azure)",
            "Excellent problem-solving and communication skills"
        ],
        benefits: ["Competitive salary and equity", "Health, dental, and vision insurance", "Flexible work arrangements", "Unlimited PTO"],
        skills: ["Node.js", "Python", "AWS", "Microservices", "Docker", "Kubernetes"],
        status: "published",
        featured: true,
        urgent: false,
    },
    {
        title: "Product Designer",
        company: "Creative Studio Inc",
        companyLogo: "/logos/creative.png",
        location: "New York, NY",
        locationType: "remote",
        category: "Design",
        type: "Full Time",
        experienceLevel: "mid",
        salary: { min: 90000, max: 130000, currency: "USD", period: "yearly" },
        description: "We're seeking a talented Product Designer to create beautiful, intuitive user experiences.",
        shortDescription: "Create beautiful, intuitive user experiences for our products.",
        responsibilities: ["Create wireframes, prototypes, and high-fidelity designs", "Conduct user research and usability testing", "Develop and maintain design systems"],
        requirements: ["4+ years of product design experience", "Strong portfolio showcasing UX/UI work", "Proficiency in Figma"],
        benefits: ["Remote-first culture", "Comprehensive health benefits", "Home office stipend"],
        skills: ["Figma", "UI/UX", "Prototyping", "User Research", "Design Systems"],
        status: "published",
        featured: true,
        urgent: true,
    },
    {
        title: "Marketing Manager",
        company: "Growth Labs",
        companyLogo: "/logos/growth.png",
        location: "Austin, TX",
        locationType: "onsite",
        category: "Marketing",
        type: "Full Time",
        experienceLevel: "mid",
        salary: { min: 80000, max: 110000, currency: "USD", period: "yearly" },
        description: "Looking for a data-driven Marketing Manager to lead our growth initiatives.",
        shortDescription: "Lead data-driven marketing strategies for growth.",
        responsibilities: ["Develop and execute multi-channel marketing campaigns", "Analyze marketing metrics", "Manage marketing budget"],
        requirements: ["5+ years of marketing experience", "Strong analytical skills", "Experience with marketing automation"],
        benefits: ["Competitive salary plus bonus", "Full benefits package", "Stock options"],
        skills: ["Digital Marketing", "Analytics", "Content Strategy", "SEO", "Paid Advertising"],
        status: "published",
        featured: false,
        urgent: false,
    },
    {
        title: "Data Scientist",
        company: "AI Innovations",
        companyLogo: "/logos/ai.png",
        location: "Seattle, WA",
        locationType: "hybrid",
        category: "Development",
        type: "Full Time",
        experienceLevel: "senior",
        salary: { min: 140000, max: 180000, currency: "USD", period: "yearly" },
        description: "Join our AI team to build machine learning models that power our core products.",
        shortDescription: "Build ML models for NLP, CV, and recommendation systems.",
        responsibilities: ["Develop and deploy machine learning models", "Analyze large datasets", "Research and implement state-of-the-art algorithms"],
        requirements: ["MS or PhD in Computer Science or Statistics", "5+ years in data science", "Strong Python and SQL skills"],
        benefits: ["Top-tier compensation", "Research publication support", "Conference attendance budget"],
        skills: ["Python", "Machine Learning", "TensorFlow", "PyTorch", "NLP", "Deep Learning"],
        status: "published",
        featured: true,
        urgent: false,
    },
    {
        title: "Customer Success Manager",
        company: "SaaS Solutions",
        companyLogo: "/logos/saas.png",
        location: "Remote",
        locationType: "remote",
        category: "Customer Service",
        type: "Full Time",
        experienceLevel: "mid",
        salary: { min: 70000, max: 95000, currency: "USD", period: "yearly" },
        description: "We're looking for a proactive Customer Success Manager to help our clients achieve their goals.",
        shortDescription: "Help enterprise clients achieve success with our platform.",
        responsibilities: ["Manage relationships with enterprise customers", "Drive product adoption", "Conduct quarterly business reviews"],
        requirements: ["3+ years in customer success", "Experience with SaaS products", "Strong relationship-building skills"],
        benefits: ["Fully remote position", "Competitive salary plus commission", "Flexible PTO"],
        skills: ["Customer Success", "Account Management", "SaaS", "Communication", "CRM"],
        status: "published",
        featured: false,
        urgent: true,
    }
];

export async function POST(request: NextRequest) {
    // Block in production environment
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    try {
        // Simple auth check for development
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== process.env.NEXTAUTH_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Clear existing jobs
        await Job.deleteMany({});

        // Insert sample jobs
        const insertedJobs = await Job.insertMany(sampleJobs);

        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${insertedJobs.length} jobs`,
            data: insertedJobs.map(j => ({ id: j._id, title: j.title, company: j.company }))
        });
    } catch (error) {
        console.error('Error seeding jobs:', error);
        return NextResponse.json(
            { error: 'Failed to seed jobs' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Use POST request with ?secret=YOUR_NEXTAUTH_SECRET to seed the database'
    });
}

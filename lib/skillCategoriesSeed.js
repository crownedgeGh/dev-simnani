// Baseline "skills of the world" taxonomy used to seed the SkillCategory
// collection the first time /api/skills is called and the collection is
// empty. Freelancers (and admins) can extend this via "Add your own" —
// those additions are persisted with isCustom: true.
export const SKILL_CATEGORIES_SEED = [
  {
    name: "IT & Software Development",
    subcategories: [
      "Web Development",
      "Mobile App Development",
      "DevOps & Cloud",
      "Cybersecurity",
      "Database Administration",
      "QA & Testing",
      "AI & Machine Learning",
      "Blockchain Development",
    ],
  },
  {
    name: "Design & Creative",
    subcategories: [
      "Graphic Design",
      "UI/UX Design",
      "Interior Design",
      "Fashion Design",
      "Animation",
      "Illustration",
      "Product Design",
    ],
  },
  {
    name: "Digital Marketing",
    subcategories: [
      "SEO",
      "Social Media Marketing",
      "Content Marketing",
      "Email Marketing",
      "PPC / Paid Advertising",
      "Influencer Marketing",
      "Marketing Analytics",
    ],
  },
  {
    name: "Writing & Translation",
    subcategories: [
      "Content Writing",
      "Copywriting",
      "Technical Writing",
      "Translation",
      "Proofreading & Editing",
      "Scriptwriting",
    ],
  },
  {
    name: "Video, Photo & Audio",
    subcategories: [
      "Video Editing",
      "Videography",
      "Photography",
      "Music Production",
      "Voice Over",
      "Audio Editing",
    ],
  },
  {
    name: "Sales & Business",
    subcategories: [
      "Business Development",
      "Sales Consulting",
      "Telecalling",
      "Market Research",
      "Business Strategy",
    ],
  },
  {
    name: "Real Estate",
    subcategories: [
      "Property Consulting",
      "Site Visits",
      "Property Valuation",
      "Leasing & Rentals",
      "Real Estate Marketing",
      "Channel Partnership",
    ],
  },
  {
    name: "Construction & Trades",
    subcategories: [
      "Civil Engineering",
      "Interior Fit-out",
      "Electrical Work",
      "Plumbing",
      "Carpentry",
      "Painting",
    ],
  },
  {
    name: "Finance & Accounting",
    subcategories: [
      "Bookkeeping",
      "Tax Consulting",
      "Financial Planning",
      "Auditing",
      "Investment Advisory",
    ],
  },
  {
    name: "Legal",
    subcategories: [
      "Property Legal Advisory",
      "Contract Drafting",
      "Legal Documentation",
      "Compliance",
    ],
  },
  {
    name: "Admin & Customer Support",
    subcategories: [
      "Virtual Assistance",
      "Data Entry",
      "Customer Support",
      "Back Office Operations",
    ],
  },
  {
    name: "Education & Training",
    subcategories: [
      "Tutoring",
      "Corporate Training",
      "Career Coaching",
      "Skill Development",
    ],
  },
  {
    name: "Engineering & Architecture",
    subcategories: [
      "Architecture",
      "Structural Engineering",
      "MEP Engineering",
      "Land Surveying",
    ],
  },
  {
    name: "Healthcare & Wellness",
    subcategories: [
      "Fitness Training",
      "Nutrition Consulting",
      "Home Healthcare",
    ],
  },
];

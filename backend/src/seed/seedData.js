// Converted 1:1 from the frontend's src/data/mockData.js so the seeded
// database matches what the UI was originally designed against (Section 18).

const demoUser = {
  name: "Aditi Sharma",
  email: "aditi.sharma@nith.ac.in",
  password: "password123",
  college: "National Institute of Technology, Hamirpur",
  branch: "Computer Science & Engineering",
  graduationYear: 2027,
  skills: ["Java", "SQL", "DSA", "Spring Boot", "React", "JavaScript", "HTML", "CSS", "Git"],
  learningSkills: [],
  preferredRoles: ["Software Developer Intern", "Backend Developer Intern"],
  preferredLocations: ["Bengaluru", "Remote", "Hyderabad"],
  preferredWorkMode: "Any",
  preferredMinStipend: 30000,
};

// Skills the demo student doesn't have yet — mirrors skillCatalog, used to
// seed a realistic spread of "required but missing" skills across postings.
const skillCatalog = [
  "AWS", "Docker", "Kubernetes", "TypeScript", "MongoDB", "Python",
  "Redis", "GraphQL", "CI/CD", "System Design", "Node.js", "Figma",
];

const internships = [
  {
    company: "ABC Technologies",
    role: "Software Developer Intern",
    location: "Bengaluru · Hybrid",
    workMode: "Hybrid",
    stipend: "₹45,000/mo",
    requiredSkills: ["Java", "SQL", "DSA", "AWS"],
    deadline: "2026-09-27",
    oaDate: "2026-09-30",
    url: "https://example.com/careers/abc-sde",
    description:
      "Join the platform engineering team to build and scale internal services that power ABC's core product. You'll work closely with senior engineers on real production systems from day one.",
  },
  {
    company: "TechNova",
    role: "Frontend Developer Intern",
    location: "Remote",
    workMode: "Remote",
    stipend: "₹30,000/mo",
    requiredSkills: ["React", "JavaScript", "HTML", "CSS"],
    deadline: "2026-09-30",
    oaDate: "2026-10-02",
    url: "https://example.com/careers/technova-fde",
    description:
      "Build delightful, accessible user interfaces for TechNova's design-tools suite used by thousands of creators worldwide.",
  },
  {
    company: "CloudPeak Systems",
    role: "Cloud Engineering Intern",
    location: "Hyderabad · On-site",
    workMode: "On-site",
    stipend: "₹40,000/mo",
    requiredSkills: ["AWS", "Docker", "Kubernetes", "Python"],
    deadline: "2026-10-01",
    url: "https://example.com/careers/cloudpeak",
    description:
      "Support the infrastructure team in deploying and monitoring containerized workloads across multi-region AWS clusters.",
  },
  {
    company: "DataByte Labs",
    role: "Backend Developer Intern",
    location: "Pune · Hybrid",
    workMode: "Hybrid",
    stipend: "₹35,000/mo",
    requiredSkills: ["Java", "Spring Boot", "SQL", "Docker"],
    deadline: "2026-09-28",
    oaDate: "2026-09-18",
    interviewDate: "2026-09-29",
    url: "https://example.com/careers/databyte",
    description:
      "Own microservices that process millions of events daily. You'll design APIs, write tests, and ship to production weekly.",
  },
  {
    company: "FinEdge",
    role: "Software Engineering Intern",
    location: "Mumbai · On-site",
    workMode: "On-site",
    stipend: "₹50,000/mo",
    requiredSkills: ["Java", "DSA", "SQL", "System Design"],
    deadline: "2026-10-05",
    url: "https://example.com/careers/finedge",
    description:
      "Work on FinEdge's trading platform backend, where correctness and low latency both matter. Mentorship from staff engineers included.",
  },
  {
    company: "PixelWorks Studio",
    role: "UI Engineer Intern",
    location: "Remote",
    workMode: "Remote",
    stipend: "₹28,000/mo",
    requiredSkills: ["React", "TypeScript", "CSS", "Figma"],
    deadline: "2026-10-03",
    url: "https://example.com/careers/pixelworks",
    description:
      "Translate product designs into pixel-perfect, animated interfaces for PixelWorks' creative suite.",
  },
  {
    company: "Nimbus Analytics",
    role: "Data Engineering Intern",
    location: "Gurugram · Hybrid",
    workMode: "Hybrid",
    stipend: "₹38,000/mo",
    requiredSkills: ["Python", "SQL", "AWS", "Docker"],
    deadline: "2026-09-29",
    oaDate: "2026-09-30",
    url: "https://example.com/careers/nimbus",
    description:
      "Build reliable ETL pipelines that feed Nimbus's analytics dashboards, used by enterprise clients across the globe.",
  },
  {
    company: "Orbitel Networks",
    role: "API Developer Intern",
    location: "Chennai · On-site",
    workMode: "On-site",
    stipend: "₹32,000/mo",
    requiredSkills: ["Java", "Spring Boot", "SQL", "GraphQL"],
    deadline: "2026-10-08",
    url: "https://example.com/careers/orbitel",
    description: "Design and document public-facing APIs that power Orbitel's telecom partner integrations.",
  },
  {
    company: "Vertex Cloud",
    role: "DevOps Intern",
    location: "Remote",
    workMode: "Remote",
    stipend: "₹42,000/mo",
    requiredSkills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    deadline: "2026-10-10",
    url: "https://example.com/careers/vertex",
    description:
      "Help build the deployment pipelines and observability stack that keep Vertex's platform running at 99.99% uptime.",
  },
  {
    company: "BrightPath EdTech",
    role: "Full Stack Intern",
    location: "Delhi NCR · Hybrid",
    workMode: "Hybrid",
    stipend: "₹33,000/mo",
    requiredSkills: ["React", "Node.js", "MongoDB", "JavaScript"],
    deadline: "2026-09-20",
    oaDate: "2026-09-05",
    interviewDate: "2026-09-14",
    url: "https://example.com/careers/brightpath",
    description: "Ship features end-to-end on BrightPath's learning platform used by over 200,000 students.",
  },
  {
    company: "QuantForge",
    role: "Software Developer Intern",
    location: "Bengaluru · On-site",
    workMode: "On-site",
    stipend: "₹55,000/mo",
    requiredSkills: ["Java", "DSA", "System Design", "Redis"],
    deadline: "2026-09-15",
    oaDate: "2026-09-01",
    interviewDate: "2026-09-10",
    url: "https://example.com/careers/quantforge",
    description: "Build low-latency services for QuantForge's risk engine. Highly selective, high-mentorship program.",
  },
  {
    company: "Streamline Systems",
    role: "QA & Test Automation Intern",
    location: "Noida · Hybrid",
    workMode: "Hybrid",
    stipend: "₹26,000/mo",
    requiredSkills: ["Python", "SQL", "Git", "CI/CD"],
    deadline: "2026-10-12",
    url: "https://example.com/careers/streamline",
    description: "Own test automation frameworks that catch regressions before they reach production.",
  },
];

// Pre-existing applications for the demo user, mirroring the original
// mockData statuses so the Dashboard/Analytics pages look populated.
const demoApplicationStatuses = {
  "ABC Technologies": "Applied",
  TechNova: "OA Pending",
  "CloudPeak Systems": "Applied",
  "DataByte Labs": "Interview",
  FinEdge: "Applied",
  "PixelWorks Studio": "Applied",
  "Nimbus Analytics": "OA Pending",
  "Orbitel Networks": "Applied",
  "Vertex Cloud": "Applied",
  "BrightPath EdTech": "Selected",
  QuantForge: "Rejected",
  "Streamline Systems": "Applied",
};

module.exports = { demoUser, skillCatalog, internships, demoApplicationStatuses };

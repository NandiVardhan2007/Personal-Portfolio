export interface SocialLink {
    platform: string;
    url: string;
    icon: string;
    username: string;
}

export interface Language {
    name: string;
    level: string;
}

export interface Personal {
    name: string;
    nickname: string;
    title: string;
    subtitle: string;
    bio: string;
    avatar: string;
    location: string;
    email: string;
    phone?: string;
    resumeUrl: string;
    languages: Language[];
    socialLinks: SocialLink[];
}

export interface ProjectFeatureGroup {
    title: string;
    items: string[];
}

export interface Project {
    id: string;
    slug: string;
    title: string;
    description: string;
    longDescription: string;
    techStack: string[];
    status: 'completed' | 'ongoing';
    featured?: boolean;
    repoUrl?: string;
    demoUrl?: string;
    role: string;
    team: string;
    timeline?: string;
    category: string;
    highlights: string[];
    features: ProjectFeatureGroup[];
    challenges?: { problem: string; solution: string }[];
    cover: string;
    gallery: string[];
}

export interface EducationItem {
    institution: string;
    degree: string;
    major: string;
    dates: string;
    score?: string;
    activities?: string;
    achievement?: string;
}

export interface ExperienceItem {
    organization: string;
    position: string;
    type: string;
    dates: string;
    description: string;
    skills: string[];
}

export type AchievementCategory = 'award' | 'certification';

export interface Achievement {
    id: string;
    title: string;
    issuer: string;
    date?: string;
    description: string;
    category: AchievementCategory;
    credentialId?: string;
    credentialUrl?: string;
    tags: string[];
    image?: string;
    pdfUrl?: string;
}

export interface TechItem {
    name: string;
    icon: string;
    category: 'language' | 'framework' | 'database' | 'cloud' | 'tool';
}

export interface HardSkill {
    name: string;
    category: 'frontend' | 'backend' | 'mobile' | 'ai' | 'data' | 'devops' | 'other';
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface SoftSkill {
    name: string;
}

export interface ToolItem {
    name: string;
    category: string;
}

export interface FAQ {
    question: string;
    answer: string;
}

export interface PortfolioData {
    personal: Personal;
    projects: Project[];
    education: EducationItem[];
    experience: ExperienceItem[];
    achievements: Achievement[];
    techStack: TechItem[];
    hardSkills: HardSkill[];
    softSkills: SoftSkill[];
    tools: ToolItem[];
    faqs: FAQ[];
    stats: {
        codingSince: number;
        projectsBuilt: number;
        technologies: number;
        certifications: number;
    };
}

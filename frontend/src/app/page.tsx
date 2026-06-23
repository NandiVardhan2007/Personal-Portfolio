import { HeroIntro } from '@/components/sections/HeroIntro';
import { About } from '@/components/sections/About';
import { ProfessionalStats } from '@/components/sections/ProfessionalStats';
import { TechStack } from '@/components/sections/TechStack';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { AchievementsSection } from '@/components/sections/AchievementsSection';
import { CodingStatsSection } from '@/components/sections/CodingStatsSection';
import { TestimonialsSection } from '@/components/sections/Testimonials';
import { ContactSection } from '@/components/sections/ContactSection';

export default function HomePage() {
    return (
        <>
            <HeroIntro />
            <About />
            <ProfessionalStats />
            <TechStack />
            <ProjectsSection />
            <AchievementsSection />
            <CodingStatsSection />
            <TestimonialsSection />
            <ContactSection />
        </>
    );
}

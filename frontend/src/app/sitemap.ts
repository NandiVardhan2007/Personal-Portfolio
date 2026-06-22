import type { MetadataRoute } from 'next';
import { portfolioData } from '@/data/portfolio';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes = ['', '/projects', '/achievements', '/contact'].map((path) => ({
        url: `${siteUrl}${path}`,
        lastModified: new Date(),
    }));

    const projectRoutes = portfolioData.projects.map((p) => ({
        url: `${siteUrl}/projects/${p.slug}`,
        lastModified: new Date(),
    }));

    return [...staticRoutes, ...projectRoutes];
}

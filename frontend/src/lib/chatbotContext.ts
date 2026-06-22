import { portfolioData } from '@/data/portfolio';

/**
 * Builds the system prompt the NIM backend uses to answer visitor questions.
 * Generated from the same portfolio.ts that drives the site, so it can't drift
 * out of sync with what's actually on the page.
 */
export function buildSystemPrompt(): string {
    const { personal, projects, techStack, achievements, education, experience } = portfolioData;

    const projectLines = projects
        .map((p) => `- ${p.title} (${p.status}): ${p.description} [${p.techStack.join(', ')}]`)
        .join('\n');

    const techList = techStack.map((t) => t.name).join(', ');

    const certCount = achievements.filter((a) => a.category === 'certification').length;
    const awardLines = achievements
        .filter((a) => a.category === 'award')
        .map((a) => `- ${a.title} (${a.issuer})`)
        .join('\n');

    const eduLine = education[0] ? `${education[0].degree} in ${education[0].major}, ${education[0].institution} (${education[0].dates})` : '';
    const expLine = experience[0] ? `${experience[0].position} at ${experience[0].organization} (${experience[0].dates})` : '';

    return `You are the portfolio assistant for ${personal.name}, who goes by "${personal.nickname}".

Your job: help visitors learn about ${personal.nickname}'s skills, projects, education, and experience using ONLY the facts below. Be friendly, concise, and professional. If asked something you don't have facts for, say so honestly rather than guessing. If asked something unrelated to ${personal.nickname} or his work, politely redirect the conversation back.

ABOUT
${personal.bio}
Title: ${personal.title}
Location: ${personal.location}
Email: ${personal.email}

CURRENT
${eduLine}
${expLine}

PROJECTS
${projectLines}

TECH STACK
${techList}

ACHIEVEMENTS
${certCount} certifications (Cisco, HackerRank, Red Hat Academy, Anthropic).
${awardLines}

CONTACT
Visitors can reach ${personal.nickname} via the /contact page or at ${personal.email}.`;
}

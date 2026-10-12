import PageFrame from "@/components/ui/PageFrame";
import Nav from "@/components/public/Nav";
import BannerSection from "@/components/public/BannerSection";
import ProfileIdentity from "@/components/public/ProfileIdentity";
import AboutSection from "@/components/public/AboutSection";
import ContactLinksRow from "@/components/public/ContactLinksRow";
import GithubHeatmap from "@/components/public/GithubHeatmap";
import ProjectsSection from "@/components/public/ProjectsSection";
import StackSection from "@/components/public/StackSection";
import LetsTalkSection from "@/components/public/LetsTalkSection";
import SideIndex from "@/components/public/SideIndex";
import { getContributionCalendar } from "@/lib/github/contributions";
import { SECTION_INDEX_META } from "@/lib/sections.js";
import {
  getPublicProfile,
  getPublicSiteSettings,
  getPublicVisibleSections,
  getPublicVisibleSkills,
  getPublicFeaturedProjects,
} from "@/lib/db/cache";

export const metadata = {
  title: "Tejas Wasnik",
  description: "Portfolio",
};


export default async function Home() {
  const [profile, siteSettings, visibleSections, skills, featuredProjects] =
    await Promise.all([
      getPublicProfile(),
      getPublicSiteSettings(),
      getPublicVisibleSections(),
      getPublicVisibleSkills(),
      getPublicFeaturedProjects(),
    ]);

  const visibleKeys = new Set(visibleSections.map((section) => section.key));
  const calendar = visibleKeys.has("github-heatmap")
    ? await getContributionCalendar(siteSettings?.githubUsername)
    : null;

  const sectionRendered = {
    about: visibleKeys.has("about") && Boolean(profile?.about),
    // "Message me" always works (it emails siteSettings.notificationEmail,
    // not a social link), so this section renders whenever it's visible —
    // unlike step 3, it no longer depends on any social link being set
    // (docs/DECISIONS.md step 5).
    "contact-links": visibleKeys.has("contact-links"),
    "github-heatmap": visibleKeys.has("github-heatmap") && Boolean(calendar),
    projects: visibleKeys.has("projects") && featuredProjects.length > 0,
    "tech-stack": visibleKeys.has("tech-stack") && skills.length > 0,
  };

  const indexEntries = visibleSections
    .filter((section) => sectionRendered[section.key] && SECTION_INDEX_META[section.key])
    .map((section) => SECTION_INDEX_META[section.key]);

  return (
    <PageFrame>
      <Nav active="home" />

      {visibleSections.map((section) => {
        switch (section.key) {
          case "banner":
            return <BannerSection key={section.key} bannerUrl={profile?.bannerUrl} />;
          case "profile":
            return <ProfileIdentity key={section.key} profile={profile} />;
          case "about":
            return sectionRendered.about ? (
              <AboutSection key={section.key} profile={profile} />
            ) : null;
          case "contact-links":
            return sectionRendered["contact-links"] ? (
              <ContactLinksRow key={section.key} socialLinks={profile?.socialLinks} />
            ) : null;
          case "github-heatmap":
            return sectionRendered["github-heatmap"] ? (
              <GithubHeatmap key={section.key} calendar={calendar} />
            ) : null;
          case "projects":
            return sectionRendered.projects ? (
              <ProjectsSection
                key={section.key}
                projects={featuredProjects}
                skills={skills}
              />
            ) : null;
          case "tech-stack":
            return sectionRendered["tech-stack"] ? (
              <StackSection key={section.key} skills={skills} />
            ) : null;
          case "lets-talk":
            return (
              <LetsTalkSection
                key={section.key}
                heading={profile?.letsTalkHeading}
                subtext={profile?.letsTalkSubtext}
                footerText={siteSettings?.footerText}
              />
            );
          default:
            return null;
        }
      })}

      <SideIndex entries={indexEntries} />
    </PageFrame>
  );
}

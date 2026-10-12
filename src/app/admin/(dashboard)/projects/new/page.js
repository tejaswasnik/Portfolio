import { getDb } from "@/lib/db/client.js";
import { findAllProjects } from "@/lib/db/collections/projects.js";
import { findAllSkills } from "@/lib/db/collections/skills.js";
import { serializeDocs } from "@/lib/db/serialize.js";
import ProjectForm from "@/components/admin/ProjectForm";

export const metadata = { title: "Admin — New project" };

/** New project (Figma 66:700). */
export default async function NewProjectPage() {
  const db = await getDb();
  const [allProjects, skills] = await Promise.all([findAllProjects(db), findAllSkills(db)]);

  return (
    <ProjectForm
      mode="create"
      project={null}
      skills={serializeDocs(skills)}
      totalCount={allProjects.length}
    />
  );
}

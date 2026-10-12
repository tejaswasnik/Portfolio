import { notFound } from "next/navigation";
import { getDb } from "@/lib/db/client.js";
import { findAllProjects, findProjectById } from "@/lib/db/collections/projects.js";
import { findAllSkills } from "@/lib/db/collections/skills.js";
import { serializeDoc, serializeDocs } from "@/lib/db/serialize.js";
import ProjectForm from "@/components/admin/ProjectForm";

export const metadata = { title: "Admin — Edit project" };

/**
 * Edit project (Figma 66:9). `params.id` is a MongoDB ObjectId string;
 * an invalid or unknown id 404s the same way the public
 * `/projects/[slug]` route does for an unpublished/missing project.
 * @param {{ params: Promise<{ id: string }> }} props
 */
export default async function EditProjectPage({ params }) {
  const { id } = await params;

  const db = await getDb();

  let project;
  try {
    project = await findProjectById(db, id);
  } catch {
    notFound();
  }
  if (!project) notFound();

  const [allProjects, skills] = await Promise.all([findAllProjects(db), findAllSkills(db)]);
  const totalCount = allProjects.filter((p) => String(p._id) !== id).length;

  return (
    <ProjectForm
      mode="edit"
      project={serializeDoc(project)}
      skills={serializeDocs(skills)}
      totalCount={totalCount}
    />
  );
}

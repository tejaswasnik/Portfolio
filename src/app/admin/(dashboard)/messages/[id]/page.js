import { notFound } from "next/navigation";
import { getDb } from "@/lib/db/client.js";
import { findMessageById, updateMessageById } from "@/lib/db/collections/messages.js";
import { serializeDoc } from "@/lib/db/serialize.js";
import MessageDetail from "@/components/admin/MessageDetail";

export const metadata = { title: "Admin — Message" };

/**
 * Admin Message detail (Figma 70:720). Opening an unread message marks
 * it read, same as any ordinary inbox.
 * @param {{ params: Promise<{ id: string }> }} props
 */
export default async function AdminMessageDetailPage({ params }) {
  const { id } = await params;

  const db = await getDb();

  let message;
  try {
    message = await findMessageById(db, id);
  } catch {
    notFound();
  }
  if (!message) notFound();

  if (!message.read) {
    await updateMessageById(db, id, { read: true });
    message.read = true;
  }

  return <MessageDetail message={serializeDoc(message)} />;
}

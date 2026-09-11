import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDocuments } from "@/lib/api";
import { DocumentList } from "@/components/document-list";

export default async function DocumentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const documents = await getDocuments(session.user.id);

  return <DocumentList documents={documents} />;
}
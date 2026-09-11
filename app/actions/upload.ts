"use server";

import { auth } from "@/auth";
import { uploadDocumentApi } from "@/lib/api";

export async function uploadDocument(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to upload a document." };
  }

  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    return { error: "Please select a file." };
  }

  if (file.type !== "application/pdf") {
    return { error: "Only PDF files are allowed." };
  }

  const maxSizeBytes = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSizeBytes) {
    return { error: "File is too large. Max size is 20MB." };
  }

  return await uploadDocumentApi(file, session.user.id);
}
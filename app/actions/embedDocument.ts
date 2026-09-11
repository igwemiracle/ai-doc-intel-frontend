"use server";

import { embedDocumentApi } from "@/lib/api";

export async function embedDocument(documentId: string) {
  return await embedDocumentApi(documentId);
}
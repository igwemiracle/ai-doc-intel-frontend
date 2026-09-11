"use server";

import { processDocumentApi } from "@/lib/api";

export async function processDocument(documentId: string) {
  return await processDocumentApi(documentId);
}
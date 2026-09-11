/**
 * Frontend API Client
 *
 * Interfaces with the external backend repository/service.
 * Configure the backend URL using NEXT_PUBLIC_BACKEND_URL in your .env.local.
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8000";

export interface RecentDoc {
  id: string;
  fileName: string;
  fileSize: number;
  status: "COMPLETED" | "PROCESSING" | "PENDING" | "FAILED";
  createdAt: string | Date;
  _count: {
    chunks: number;
  };
}

export interface DashboardMetrics {
  documentsCount: number;
  processedCount: number;
  totalChunks: number;
  totalSizeBytes: number;
  recentDocs: RecentDoc[];
}

export interface DocumentItem {
  id: string;
  fileName: string;
  fileSize: number;
  createdAt: string | Date;
  status: "COMPLETED" | "PROCESSING" | "PENDING" | "FAILED";
  errorMessage: string | null;
  _count: {
    chunks: number;
  };
}

export interface SearchResult {
  chunkId: string;
  documentId: string;
  fileName: string;
  content: string;
  distance: number;
}

export interface RAGResponse {
  answer: string;
  sources: { fileName: string; content: string; cited: boolean }[];
}

export interface BackendUser {
  id: string;
  email: string;
  name?: string | null;
  token?: string;
}

/**
 * Fetch dashboard overview metrics and recent documents.
 */
export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/dashboard/metrics?userId=${encodeURIComponent(userId)}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch dashboard metrics: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("getDashboardMetrics error:", error);
    // Return safe empty fallback structure
    return {
      documentsCount: 0,
      processedCount: 0,
      totalChunks: 0,
      totalSizeBytes: 0,
      recentDocs: [],
    };
  }
}

/**
 * Fetch all documents for a given user.
 */
export async function getDocuments(userId: string): Promise<DocumentItem[]> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/documents?userId=${encodeURIComponent(userId)}`,
      {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch documents: ${res.statusText}`);
    }

    const data = await res.json();

    return Array.isArray(data.documents) ? data.documents : [];
  } catch (error) {
    console.error("getDocuments error:", error);
    return [];
  }
}

/**
 * Upload a document file to the backend service.
 * 
 */
export async function uploadDocumentApi(
  file: File,
  userId: string
): Promise<{ success?: boolean; error?: string; documentId?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    const res = await fetch(`${BACKEND_URL}/api/documents/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Upload failed." };
    }

    return { success: true, documentId: data.documentId };
  } catch (error) {
    console.error("uploadDocument error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to connect to backend server.",
    };
  }
}

/**
 * Trigger text extraction / processing for an uploaded document.
 */
export async function processDocumentApi(documentId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/documents/${encodeURIComponent(documentId)}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Processing failed." };
    }

    return { success: true };
  } catch (error) {
    console.error("processDocument error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to connect to backend server.",
    };
  }
}

/**
 * Trigger embedding generation for a processed document.
 */
export async function embedDocumentApi(
  documentId: string
): Promise<{ success?: boolean; error?: string; chunkCount?: number }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/documents/${encodeURIComponent(documentId)}/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Embedding failed." };
    }

    return { success: true, chunkCount: data.chunkCount };
  } catch (error) {
    console.error("embedDocument error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to connect to backend server.",
    };
  }
}

/**
 * Semantic vector search across document chunks.
 */
export async function searchChunks(
  query: string,
  userId: string,
  limit: number = 5,
  documentId?: string
): Promise<SearchResult[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, userId, limit, documentId }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Search failed: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("searchChunks error:", error);
    return [];
  }
}

/**
 * RAG question answering grounded in document excerpts.
 */
export async function generateAnswer(
  question: string,
  userId: string,
  documentId?: string
): Promise<RAGResponse> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/rag/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, userId, documentId }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Answer generation failed: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("generateAnswer error:", error);
    return {
      answer: "Unable to retrieve answer from backend server. Please check your backend connection.",
      sources: [],
    };
  }
}

/**
 * Register a new user via the backend auth service.
 */
export async function registerUser(
  email: string,
  password: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Signup failed." };
    }

    return { success: true };
  } catch (error) {
    console.error("registerUser error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to connect to backend server.",
    };
  }
}

/**
 * Authenticate credentials against backend service.
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<BackendUser | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    return data.user;
  } catch (error) {
    console.error("verifyCredentials error:", error);
    return null;
  }
}
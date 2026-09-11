import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDashboardMetrics } from "@/lib/api";
import { formatFileSize, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  FileText,
  UploadCloud,
  Search,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  HardDrive,
  Cpu,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  console.log("USER Email", session.user.email?.split("@")[0])
  console.log("user id: ", userId)
  console.log("SESSION USER:", session.user);

  const {
    documentsCount,
    processedCount,
    totalChunks,
    totalSizeBytes,
    recentDocs,
  } = await getDashboardMetrics(userId);

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/40 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              <span>AI Document Intelligence Hub</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {session.user.name || session.user.email?.split("@")[0]}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Your personal research platform. Upload PDF documents, generate vector embeddings,
              and query your documents with Gemini-powered AI grounding.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild className="gap-2 shadow-sm">
              <Link href="/dashboard/upload">
                <Plus className="h-4 w-4" />
                Upload PDF
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/dashboard/ask">
                <Sparkles className="h-4 w-4 text-primary" />
                Ask Assistant
              </Link>
            </Button>
          </div>
        </div>

        {/* Ambient subtle background glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/10 to-pink-500/10 blur-3xl" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <Card className="border-border/60 shadow-sm transition-all hover:border-border hover:shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Documents</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight">{documentsCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium text-emerald-500">{processedCount}</span> processed & ready
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="border-border/60 shadow-sm transition-all hover:border-border hover:shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Vector Chunks</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight">{totalChunks}</div>
              <p className="mt-1 text-xs text-muted-foreground">768-dimensional embeddings</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="border-border/60 shadow-sm transition-all hover:border-border hover:shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Storage Used</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <HardDrive className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight">
                {formatFileSize(totalSizeBytes)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Free-tier Cloudflare R2 / Supabase</p>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="border-border/60 shadow-sm transition-all hover:border-border hover:shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">AI Retrieval Engine</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold">Ready for RAG</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Neon pgvector + Gemini 3.6</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Spotlights */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/upload"
          className="group relative flex flex-col justify-between rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
          <div className="space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <UploadCloud className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-foreground">1. Upload Documents</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload PDF research papers, contracts, or guides up to 20MB. Fast text extraction with unpdf.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
            <span>Upload PDF</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/dashboard/search"
          className="group relative flex flex-col justify-between rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
          <div className="space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <Search className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-foreground">2. Semantic Search</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Find exact passages with vector cosine distance. Search ideas and meaning, not just exact keywords.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
            <span>Search Chunks</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/dashboard/ask"
          className="group relative flex flex-col justify-between rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
          <div className="space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-foreground">3. Ask AI Grounded Q&A</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Chat with your documents. Every answer is strictly grounded with verifiable inline citations.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
            <span>Ask Assistant</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* Recent Documents Table & Activity */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Recent Documents</CardTitle>
            <CardDescription className="text-xs">
              Quick access to your most recently uploaded files
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
            <Link href="/dashboard/documents">
              <span>View all ({documentsCount})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">No documents uploaded yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Upload your first PDF document to begin extracting text and running semantic queries.
                </p>
              </div>
              <Button asChild size="sm" className="mt-2 gap-2">
                <Link href="/dashboard/upload">
                  <UploadCloud className="h-4 w-4" />
                  Upload First PDF
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {recentDocs.map((doc) => {
                const statusMap = {
                  COMPLETED: {
                    label: "Ready",
                    icon: CheckCircle2,
                    className: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400",
                  },
                  PROCESSING: {
                    label: "Processing",
                    icon: Clock,
                    className: "text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400",
                  },
                  PENDING: {
                    label: "Waiting",
                    icon: Clock,
                    className: "text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400",
                  },
                  FAILED: {
                    label: "Failed",
                    icon: AlertCircle,
                    className: "text-rose-600 bg-rose-500/10 border-rose-500/20 dark:text-rose-400",
                  },
                };
                const config = statusMap[doc.status];
                const StatusIcon = config.icon;

                return (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {doc.fileName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span>•</span>
                          <span>{formatDate(doc.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${config.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                        {doc.status === "COMPLETED" && (
                          <Badge variant="outline" className="text-xs">
                            {doc._count.chunks} chunks
                          </Badge>
                        )}
                      </div>

                      <Button asChild size="sm" variant="ghost">
                        <Link href="/dashboard/documents">
                          Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { searchChunks } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Search, Sparkles, Layers, Database, ArrowRight } from "lucide-react";
import { SearchResultsView } from "@/components/search-results";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchChunks(query, session.user.id) : [];

  const sampleQueries = [
    "Key conclusions and findings",
    "Security architecture and authentication",
    "Pricing models and refund terms",
    "Implementation timeline and roadmap",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Heading */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Semantic Vector Search</h2>
        <p className="text-xs text-muted-foreground">
          Search ideas and concepts across all your indexed PDF documents using 768-dimensional vector embeddings.
        </p>
      </div>

      {/* Search Input Card */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <form method="GET" className="space-y-4">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                name="q"
                placeholder="Search concepts, questions, or keywords across your documents..."
                defaultValue={query}
                autoFocus
                className="h-11 pl-10 pr-24 text-sm bg-muted/20 focus-visible:bg-background"
              />
              <div className="absolute right-1.5">
                <Button type="submit" size="sm" className="h-8 gap-1.5 px-3">
                  <Search className="h-3.5 w-3.5" />
                  <span>Search</span>
                </Button>
              </div>
            </div>

            {/* Suggested Sample Queries */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-muted-foreground mr-1">
                Try searching:
              </span>
              {sampleQueries.map((sample) => (
                <Link
                  key={sample}
                  href={`/dashboard/search?q=${encodeURIComponent(sample)}`}
                  className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground"
                >
                  {sample}
                </Link>
              ))}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {query ? (
        <SearchResultsView query={query} results={results} />
      ) : (
        /* Explainer when no search performed yet */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Database className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">Beyond Keyword Match</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Vector search understands synonyms and semantic intent. Searching for &quot;cost&quot; will find passages about &quot;pricing&quot; and &quot;fees&quot;.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">Chunk-Level Precision</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Documents are indexed in overlapping context chunks so you retrieve the exact paragraph that matters.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">Bridge to AI Q&A</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Found an interesting excerpt? Jump directly to the AI Assistant to synthesize answers grounded in that source.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  FileText,
  Share2,
  Calendar,
  AlertTriangle,
  Download,
  Filter,
} from "lucide-react";
import { StatTile } from "@/components/admin/StatTile";
import { EmptyState } from "@/components/admin/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Insights · Nirvana Admin" }] }),
  component: AdminAnalyticsPage,
});

interface TrafficRow {
  day: string;
  pageviews: number;
  unique_visitors: number;
}

interface TopPageRow {
  path: string;
  pageviews: number;
  unique_visitors: number;
}

interface SourceRow {
  source: string;
  referrer_host: string | null;
  pageviews: number;
}

interface ConversionsData {
  session_requests?: Record<string, number>;
  corporate_inquiries?: Record<string, number>;
  contact_messages?: number;
  book_page_views?: number;
}

interface AnalyticsHealth {
  total_events: number;
  last_event_at: string | null;
  ever_collected: boolean;
}

function sumValues(obj: Record<string, number> | undefined) {
  return Object.values(obj ?? {}).reduce((a, b) => a + b, 0);
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [traffic, setTraffic] = useState<TrafficRow[]>([]);
  const [topPages, setTopPages] = useState<TopPageRow[]>([]);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [conversions, setConversions] = useState<ConversionsData>({});
  const [health, setHealth] = useState<AnalyticsHealth | null>(null);

  const getDateRange = () => {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - days);
    return {
      from: fromDate.toISOString().split("T")[0],
      to: toDate.toISOString().split("T")[0],
    };
  };

  const loadData = async () => {
    setLoading(true);
    const { from, to } = getDateRange();

    try {
      const [tRes, tpRes, sRes, cRes, hRes] = await Promise.all([
        supabase.rpc("analytics_traffic", { p_from: from, p_to: to }),
        supabase.rpc("analytics_top_pages", { p_from: from, p_to: to, p_limit: 15 }),
        supabase.rpc("analytics_sources", { p_from: from, p_to: to }),
        supabase.rpc("analytics_conversions", { p_from: from, p_to: to }),
        supabase.rpc("analytics_health"),
      ]);

      if (tRes.data) setTraffic(tRes.data as TrafficRow[]);
      if (tpRes.data) setTopPages(tpRes.data as TopPageRow[]);
      if (sRes.data) setSources(sRes.data as SourceRow[]);
      if (cRes.data) setConversions(cRes.data as ConversionsData);
      if (hRes.data) setHealth(hRes.data as unknown as AnalyticsHealth);
    } catch (e) {
      console.error("Error fetching analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const totalPageviews = traffic.reduce((acc, curr) => acc + (Number(curr.pageviews) || 0), 0);
  const totalUnique = traffic.reduce((acc, curr) => acc + (Number(curr.unique_visitors) || 0), 0);

  const requestedTotal =
    sumValues(conversions.session_requests) + sumValues(conversions.corporate_inquiries);
  const confirmedTotal =
    (conversions.session_requests?.confirmed ?? 0) +
    (conversions.corporate_inquiries?.confirmed ?? 0);
  const bookPageViews = conversions.book_page_views ?? 0;

  const funnelStages = [
    { label: "Site visits", value: totalPageviews },
    { label: "Viewed Book page", value: bookPageViews },
    { label: "Requested", value: requestedTotal },
    { label: "Confirmed", value: confirmedTotal },
  ];

  function exportTrafficCsv() {
    downloadCsv(`nirvana-traffic-${days}d.csv`, [
      ["Day", "Pageviews", "Unique Visitors"],
      ...traffic.map((r) => [r.day, r.pageviews, r.unique_visitors]),
    ]);
  }

  return (
    <div className="space-y-6">
      {/* Header & Date Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          First-party, privacy-focused traffic and conversion data.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            <Calendar className="ml-2 h-4 w-4 text-muted-foreground" />
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs transition-colors",
                  days === d
                    ? "bg-gold-deep text-white font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Last {d} days
              </button>
            ))}
          </div>
          <button
            onClick={exportTrafficCsv}
            disabled={traffic.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {!loading && health && !health.ever_collected && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3.5 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium">Analytics has never recorded a pageview.</p>
            <p className="mt-0.5 text-amber-800">
              This usually means{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code> or{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5">ANALYTICS_SALT</code> aren't set on
              the deploy host —{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5">/api/collect</code> silently
              returns 204 without either. It doesn't necessarily mean the site has no traffic.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Stat Overview Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile
              icon={TrendingUp}
              label="Total Pageviews"
              value={totalPageviews.toLocaleString()}
            />
            <StatTile icon={Users} label="Unique Visitors" value={totalUnique.toLocaleString()} />
            <StatTile
              icon={FileText}
              label="Book Page Views"
              value={bookPageViews.toLocaleString()}
            />
            <StatTile
              icon={Share2}
              label="Requests Confirmed"
              value={confirmedTotal.toLocaleString()}
            />
          </div>

          {/* Conversion funnel */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 font-display text-lg text-foreground">
              <Filter className="h-4 w-4 text-gold-deep" /> Conversion Funnel
            </h3>
            <div className="space-y-3">
              {funnelStages.map((stage, i) => {
                const max = funnelStages[0].value || 1;
                const widthPct = Math.max(4, Math.round((stage.value / max) * 100));
                const pctOfFirst =
                  funnelStages[0].value > 0
                    ? Math.round((stage.value / funnelStages[0].value) * 100)
                    : 0;
                return (
                  <div key={stage.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{stage.label}</span>
                      <span className="tabular-nums text-foreground">
                        {stage.value.toLocaleString()}
                        {i > 0 && (
                          <span className="ml-1.5 text-muted-foreground">({pctOfFirst}%)</span>
                        )}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary/50">
                      <div
                        className="h-full rounded-full bg-gold-gradient transition-all"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Traffic Trend Chart */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <h3 className="mb-4 font-display text-lg text-foreground">
              Visitor &amp; Pageview Trends
            </h3>
            {traffic.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No traffic recorded"
                description="Once pageviews start coming in, this chart fills in automatically."
              />
            ) : (
              <div className="h-64 w-full sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={traffic} margin={{ left: -20, right: 8 }}>
                    <defs>
                      <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B8862E" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#B8862E" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.88 0.015 82)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      stroke="var(--stone)"
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      minTickGap={32}
                      style={{ fontSize: "11px" }}
                    />
                    <YAxis
                      stroke="var(--stone)"
                      tickLine={false}
                      axisLine={false}
                      width={36}
                      style={{ fontSize: "11px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "var(--foreground)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pageviews"
                      name="Pageviews"
                      stroke="#B8862E"
                      fillOpacity={1}
                      fill="url(#colorPv)"
                    />
                    <Area
                      type="monotone"
                      dataKey="unique_visitors"
                      name="Unique Visitors"
                      stroke="#2563EB"
                      fillOpacity={1}
                      fill="url(#colorUv)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Breakdown Tables / Grids */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Top Visited Pages */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 font-display text-lg text-foreground">Top Visited Pages</h3>
              {topPages.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No page data recorded.
                </p>
              ) : (
                <div className="space-y-2">
                  {topPages.map((tp) => (
                    <div
                      key={tp.path}
                      className="flex items-center gap-3 border-b border-border pb-2 text-sm last:border-0"
                    >
                      <span className="min-w-0 flex-1 truncate font-mono text-xs text-gold-deep">
                        {tp.path}
                      </span>
                      <div className="flex shrink-0 gap-3 text-xs text-muted-foreground">
                        <span>{tp.pageviews} views</span>
                        <span className="hidden sm:inline">{tp.unique_visitors} unique</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Referral Sources */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
              <h3 className="mb-4 font-display text-lg text-foreground">Traffic Channels</h3>
              {sources.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No source data recorded.
                </p>
              ) : (
                <div className="space-y-3">
                  {sources.slice(0, 10).map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 rounded bg-secondary px-2 py-0.5 text-[10px] capitalize text-gold-deep">
                          {s.source}
                        </span>
                        <span className="truncate text-xs text-foreground">
                          {s.referrer_host || "Direct / Bookmark"}
                        </span>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {s.pageviews} views
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

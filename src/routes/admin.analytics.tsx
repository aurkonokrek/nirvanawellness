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
  BarChart,
  Bar,
} from "recharts";
import { Loader2, TrendingUp, Users, FileText, Share2, Calendar } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Nirvana Admin" }] }),
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
  corporate_inquiries?: number;
  contact_messages?: number;
  book_page_views?: number;
}

function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [traffic, setTraffic] = useState<TrafficRow[]>([]);
  const [topPages, setTopPages] = useState<TopPageRow[]>([]);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [conversions, setConversions] = useState<ConversionsData>({});

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
      const [tRes, tpRes, sRes, cRes] = await Promise.all([
        supabase.rpc("analytics_traffic", { p_from: from, p_to: to }),
        supabase.rpc("analytics_top_pages", { p_from: from, p_to: to, p_limit: 15 }),
        supabase.rpc("analytics_sources", { p_from: from, p_to: to }),
        supabase.rpc("analytics_conversions", { p_from: from, p_to: to }),
      ]);

      if (tRes.data) setTraffic(tRes.data as TrafficRow[]);
      if (tpRes.data) setTopPages(tpRes.data as TopPageRow[]);
      if (sRes.data) setSources(sRes.data as SourceRow[]);
      if (cRes.data) setConversions(cRes.data as ConversionsData);
    } catch (e) {
      console.error("Error fetching analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [days]);

  const totalPageviews = traffic.reduce((acc, curr) => acc + (Number(curr.pageviews) || 0), 0);
  const totalUnique = traffic.reduce((acc, curr) => acc + (Number(curr.unique_visitors) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header & Date Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-[#F5F1EA]">Traffic & Conversion Analytics</h2>
          <p className="text-sm text-[#8A8272]">First-party privacy-focused metrics</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1">
          <Calendar className="ml-2 h-4 w-4 text-[#8A8272]" />
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={[
                "rounded-md px-3 py-1.5 text-xs transition-colors",
                days === d
                  ? "bg-[#C9A05C] text-[#0B1B3A] font-medium"
                  : "text-[#8A8272] hover:text-[#F5F1EA]",
              ].join(" ")}
            >
              Last {d} days
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#C9A05C]" />
        </div>
      ) : (
        <>
          {/* Stat Overview Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-[#C9A05C]" />}
              label="Total Pageviews"
              value={totalPageviews.toLocaleString()}
            />
            <StatCard
              icon={<Users className="h-5 w-5 text-[#60A5FA]" />}
              label="Unique Visitors"
              value={totalUnique.toLocaleString()}
            />
            <StatCard
              icon={<FileText className="h-5 w-5 text-[#34D399]" />}
              label="Book Page Views"
              value={(conversions.book_page_views || 0).toLocaleString()}
            />
            <StatCard
              icon={<Share2 className="h-5 w-5 text-[#A78BFA]" />}
              label="Sessions Requested"
              value={Object.values(conversions.session_requests || {}).reduce((a, b) => a + b, 0).toLocaleString()}
            />
          </div>

          {/* Traffic Trend Chart */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
            <h3 className="mb-4 font-display text-lg text-[#F5F1EA]">Visitor & Pageview Trends</h3>
            {traffic.length === 0 ? (
              <div className="py-16 text-center text-[#8A8272]">No traffic recorded in this timeframe yet.</div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={traffic}>
                    <defs>
                      <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9A05C" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#C9A05C" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" stroke="#8A8272" tickLine={false} style={{ fontSize: "12px" }} />
                    <YAxis stroke="#8A8272" tickLine={false} style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0B1B3A", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                      itemStyle={{ color: "#F5F1EA", fontSize: "12px" }}
                    />
                    <Area type="monotone" dataKey="pageviews" name="Pageviews" stroke="#C9A05C" fillOpacity={1} fill="url(#colorPv)" />
                    <Area type="monotone" dataKey="unique_visitors" name="Unique Visitors" stroke="#60A5FA" fillOpacity={1} fill="url(#colorUv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Breakdown Tables / Grids */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Visited Pages */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="mb-4 font-display text-lg text-[#F5F1EA]">Top Visited Pages</h3>
              {topPages.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#8A8272]">No page data recorded.</div>
              ) : (
                <div className="space-y-2">
                  {topPages.map((tp) => (
                    <div key={tp.path} className="flex items-center justify-between border-b border-white/5 pb-2 text-sm">
                      <span className="font-mono text-xs text-[#E8C878] truncate max-w-[240px]">{tp.path}</span>
                      <div className="flex gap-4 text-xs text-[#8A8272]">
                        <span>{tp.pageviews} views</span>
                        <span>{tp.unique_visitors} unique</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Referral Sources */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="mb-4 font-display text-lg text-[#F5F1EA]">Traffic Channels</h3>
              {sources.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#8A8272]">No source data recorded.</div>
              ) : (
                <div className="space-y-3">
                  {sources.slice(0, 10).map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="capitalize rounded bg-white/10 px-2 py-0.5 text-[10px] text-[#C9A05C]">{s.source}</span>
                        <span className="text-xs text-[#F5F1EA]">{s.referrer_host || "Direct / Bookmark"}</span>
                      </div>
                      <span className="text-xs text-[#8A8272]">{s.pageviews} views</span>
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

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#8A8272]">{label}</span>
        {icon}
      </div>
      <div className="mt-2 font-display text-3xl text-[#F5F1EA]">{value}</div>
    </div>
  );
}

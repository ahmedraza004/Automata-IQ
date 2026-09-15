"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface PerformanceChartsProps {
  data: {
    execution_trend: Array<{ day: string; success: number; failure: number }>;
    confidence_distribution: Array<{ range: string; count: number; fill: string }>;
    recovery_trend: Array<{ month: string; recovered: number; overdue: number }>;
  };
}

export function PerformanceCharts({ data }: PerformanceChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 7-Day Throughput Trend */}
      <div className="lg:col-span-2 glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-white text-base">Autonomous Pipeline Execution Volume</h3>
            <p className="text-xs text-slate-400">Total automated process runs vs errors over last 7 days</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
              <span className="text-slate-300">Success</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-300">Failure / Exception</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.execution_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorFail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" tickLine={false} fontSize={12} />
              <YAxis stroke="#64748b" tickLine={false} fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
                }}
              />
              <Area type="monotone" dataKey="success" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSuccess)" />
              <Area type="monotone" dataKey="failure" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorFail)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Confidence Distribution */}
      <div className="glass-panel p-5">
        <div className="mb-4">
          <h3 className="font-display font-bold text-white text-base">AI Decision Confidence Tiering</h3>
          <p className="text-xs text-slate-400">Autonomous Execution vs Review Queues</p>
        </div>

        <div className="h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data?.confidence_distribution || []}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="count"
              >
                {data?.confidence_distribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="#0b0f17" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "10px",
                  fontSize: "12px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 mt-2">
          {data?.confidence_distribution?.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }}></span>
                <span className="text-slate-300 font-medium">{item.range}</span>
              </div>
              <span className="font-mono font-bold text-white">{item.count}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

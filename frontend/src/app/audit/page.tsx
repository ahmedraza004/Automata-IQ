"use client";

import { useEffect, useState } from "react";
import {
  History,
  Download,
  Search,
  Filter,
  FileCode,
  ShieldCheck,
  Calendar,
  User,
  Eye,
  CheckCircle2
} from "lucide-react";
import { api } from "@/lib/api";
import { AuditLog } from "@/types";
import { formatDate } from "@/lib/utils";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadLogs = async () => {
    try {
      const list = await api.getAuditLogs({
        action: searchTerm || undefined,
        entity_type: entityFilter || undefined,
      });
      setLogs(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [searchTerm, entityFilter]);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Immutable Compliance Ledger</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Audit Trail & Compliance Explorer</h1>
          <p className="text-xs text-slate-400">Cryptographically verifiable, tamper-evident audit record of every agent reasoning trace, decision, and operator action.</p>
        </div>

        <a
          href={api.getAuditExportCsvUrl()}
          download
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-all shadow-sm"
        >
          <Download className="w-4 h-4 text-brand-400" />
          <span>Export Audit Ledger (CSV)</span>
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actions (e.g. ai_decision, workflow.executed)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500 text-xs"
            />
          </div>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500 text-xs"
          >
            <option value="">All Entity Types</option>
            <option value="ai_decision">AI Decision</option>
            <option value="workflow">Workflow</option>
            <option value="escalation">Escalation</option>
            <option value="user">User</option>
            <option value="sentinel">Sentinel</option>
          </select>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          {logs.length} Audit Entries
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Entity Type & ID</th>
                <th className="px-5 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-dark-850/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-slate-400 whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-white">
                    <span className="px-2 py-0.5 rounded bg-brand-950/80 text-brand-300 border border-brand-800/50 font-mono text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.actor_email || log.actor_id}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-400">
                    {log.entity_type} {log.entity_id && `(${log.entity_id.substring(0, 8)}...)`}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2.5 py-1 rounded bg-dark-850 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors inline-flex items-center gap-1 text-[11px]"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect Payload</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            No audit records matching criteria.
          </div>
        )}
      </div>

      {/* JSON Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-display font-bold text-white text-base">Audit Entry Detail</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedLog.action} • {formatDate(selectedLog.timestamp)}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-3 py-1 rounded-lg bg-dark-850 border border-slate-700 text-slate-300 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Payload Diff & Metadata</span>
              <pre className="p-4 rounded-xl bg-dark-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-72">
                {JSON.stringify(selectedLog.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Settings,
  BrainCircuit,
  Sliders,
  ShieldCheck,
  Save,
  CheckCircle2,
  Key,
  Database,
  Layers,
  Sparkles
} from "lucide-react";

export default function SettingsPage() {
  const [modelProvider, setModelProvider] = useState("gemini");
  const [autoThreshold, setAutoThreshold] = useState(95);
  const [reviewThreshold, setReviewThreshold] = useState(80);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">System Settings & AI Calibration</h1>
          <p className="text-xs text-slate-400">Configure multi-model gateways, autonomous confidence thresholds, and deterministic guardrail bounds.</p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider shadow-glow-brand transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save System Config</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800/70 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configuration changes successfully applied to operational pipeline!</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Gateway */}
        <div className="glass-panel p-6 space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <BrainCircuit className="w-4 h-4 text-brand-400" />
            <h3 className="font-display font-bold text-white text-sm">AI Model Gateway</h3>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Default Model Provider</label>
            <select
              value={modelProvider}
              onChange={(e) => setModelProvider(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
            >
              <option value="gemini">Google Gemini (gemini-2.5-flash) [Recommended]</option>
              <option value="openai">OpenAI (GPT-4o)</option>
              <option value="claude">Anthropic Claude (Claude 3.5 Sonnet)</option>
              <option value="simulation">High-Fidelity Neural Simulation (Offline Mode)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Gemini API Key</label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="AIzaSy... (Optional: leave blank for simulation engine)"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Confidence Thresholds */}
        <div className="glass-panel p-6 space-y-5 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="font-display font-bold text-white text-sm">Confidence & Autonomy Routing</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between font-medium">
              <span className="text-slate-300">Auto-Execution Threshold</span>
              <span className="text-emerald-400 font-bold font-mono">{autoThreshold}%</span>
            </div>
            <input
              type="range"
              min="85"
              max="99"
              value={autoThreshold}
              onChange={(e) => setAutoThreshold(parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[11px] text-slate-400">Decisions scoring ≥ {autoThreshold}% are executed autonomously.</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between font-medium">
              <span className="text-slate-300">Manager Review Threshold</span>
              <span className="text-amber-400 font-bold font-mono">{reviewThreshold}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="90"
              value={reviewThreshold}
              onChange={(e) => setReviewThreshold(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <p className="text-[11px] text-slate-400">Decisions between {reviewThreshold}% and {autoThreshold - 1}% trigger Slack Block Kit review cards.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

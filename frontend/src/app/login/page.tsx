"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@automatai.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoRole = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-950">
      <div className="max-w-md w-full glass-panel p-8 space-y-6 animate-fade-in border-brand-500/30">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-violet flex items-center justify-center shadow-glow-brand mx-auto">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
            Automata<span className="text-brand-400">IQ</span>
          </h2>
          <p className="text-xs text-slate-400">Autonomous AI Operations & Decision Verification Platform</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800/70 text-rose-300 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Enterprise Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-violet hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider shadow-glow-brand transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Operations Command"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
            One-Click Demo Roles
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => fillDemoRole("admin@automatai.com", "admin123")}
              className="p-2 rounded-lg bg-dark-850 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 transition-colors text-left"
            >
              👑 <strong>Executive Admin</strong>
            </button>
            <button
              onClick={() => fillDemoRole("manager@automatai.com", "manager123")}
              className="p-2 rounded-lg bg-dark-850 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 transition-colors text-left"
            >
              💼 <strong>Ops Manager</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { getSetting, setSetting } from "@/lib/db";

type AIMode = "none" | "byok" | "official";
type AIProvider = "openai" | "anthropic" | "ollama" | "groq";

const providers: { id: AIProvider; name: string; logo: string }[] = [
  { id: "openai", name: "OpenAI", logo: "🤖" },
  { id: "anthropic", name: "Anthropic", logo: "🧠" },
  { id: "ollama", name: "Ollama (Local)", logo: "💻" },
  { id: "groq", name: "Groq", logo: "⚡" },
];

export default function SettingsPage() {
  const [aiMode, setAiMode] = useState<AIMode>("none");
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getSetting("ai_mode"),
      getSetting("ai_provider"),
      getSetting("ai_api_key"),
      getSetting("ai_base_url"),
      getSetting("ai_model"),
    ]).then(([mode, prov, key, url, mdl]) => {
      if (mode) setAiMode(mode as AIMode);
      if (prov) setProvider(prov as AIProvider);
      if (key) setApiKey(key);
      if (url) setBaseUrl(url);
      if (mdl) setModel(mdl);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await Promise.all([
      setSetting("ai_mode", aiMode),
      setSetting("ai_provider", provider),
      setSetting("ai_api_key", apiKey),
      setSetting("ai_base_url", baseUrl),
      setSetting("ai_model", model),
    ]);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Settings</h1>
        <p className="text-[#A89585] text-sm">Configure your AI provider and API keys.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* ── AI Mode ─────────────────────────────────────────────── */}
        <section className="bg-[#FFFFFF] border border-[#E8DDD3] rounded-2xl p-6">
          <h2 className="font-semibold text-base mb-1">AI Mode</h2>
          <p className="text-xs text-[#D6C5B5] mb-4">How do you want to power AI features?</p>

          <div className="space-y-2">
            {[
              { id: "none", label: "Pure Offline", desc: "No AI. Use FSRS review only, free forever.", icon: "🚫" },
              { id: "byok", label: "BYOK — Bring Your Own Key", desc: "Use your own API key. You pay the provider directly.", icon: "🔑" },
            ].map(({ id, label, desc, icon }) => (
              <label
                key={id}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  aiMode === id
                    ? "border-indigo-500/40 bg-indigo-500/5"
                    : "border-[#E8DDD3] hover:border-[#D4C4B0]"
                }`}
              >
                <input
                  type="radio"
                  name="aiMode"
                  value={id}
                  checked={aiMode === id}
                  onChange={() => setAiMode(id as AIMode)}
                  className="mt-0.5 accent-indigo-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <span className="font-medium text-sm">{label}</span>
                  </div>
                  <p className="text-xs text-[#D6C5B5] mt-0.5">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* ── Provider (shown when AI is enabled) ─────────────────── */}
        {aiMode !== "none" && (
          <section className="bg-[#FFFFFF] border border-[#E8DDD3] rounded-2xl p-6 animate-slide-up">
            <h2 className="font-semibold text-base mb-1">AI Provider</h2>
            <p className="text-xs text-[#D6C5B5] mb-4">Choose your AI model provider.</p>

            <div className="grid grid-cols-2 gap-2">
              {providers.map(({ id, name, logo }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setProvider(id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    provider === id
                      ? "border-indigo-500/40 bg-indigo-500/5"
                      : "border-[#E8DDD3] hover:border-[#D4C4B0]"
                  }`}
                >
                  <div className="text-xl mb-1">{logo}</div>
                  <div className={`text-sm font-medium ${provider === id ? "text-indigo-300" : ""}`}>{name}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── API Key & Base URL (BYOK mode) ───────────────────────── */}
        {aiMode === "byok" && (
          <section className="bg-[#FFFFFF] border border-[#E8DDD3] rounded-2xl p-6 space-y-4 animate-slide-up">
            <div>
              <h2 className="font-semibold text-base mb-1">API Key</h2>
              <p className="text-xs text-[#D6C5B5] mb-3">
                Your key is stored locally in IndexedDB and never sent to our servers.
              </p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2.5 bg-[#FFF5EB] border border-[#E8DDD3] rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-[#D6C5B5] font-mono"
              />
            </div>

            {provider === "ollama" && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Base URL</label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full px-4 py-2.5 bg-[#FFF5EB] border border-[#E8DDD3] rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-[#D6C5B5]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={provider === "openai" ? "gpt-4o-mini" : provider === "anthropic" ? "claude-sonnet-4-20250514" : provider === "ollama" ? "llama3.2" : "llama-3.3-70b-versatile"}
                className="w-full px-4 py-2.5 bg-[#FFF5EB] border border-[#E8DDD3] rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-[#D6C5B5]"
              />
            </div>
          </section>
        )}

        {/* ── Save ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-sm transition-all btn-glow"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && (
            <span className="text-sm text-green-400 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </span>
          )}
        </div>
      </form>

      {/* ── Danger zone ───────────────────────────────────────────── */}
      <section className="mt-10 border-t border-[#FFFFFF] pt-8">
        <h3 className="text-sm font-semibold text-[#D6C5B5] mb-4 uppercase tracking-wider">Data</h3>
        <button
          onClick={async () => {
            if (confirm("Clear ALL data (decks, cards, reviews)? This cannot be undone.")) {
              const { db } = await import("@/lib/db");
              await db.delete();
              window.location.reload();
            }
          }}
          className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-colors"
        >
          Clear All Data
        </button>
      </section>
    </div>
  );
}

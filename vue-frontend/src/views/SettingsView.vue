<script setup>
import { ref } from 'vue'
import { settings, getSettings } from '../stores/settings'

const s = getSettings()
const saving = ref(false)
const saved = ref(false)

const providerOptions = [
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'huggingface', label: 'HuggingFace' },
]

const modelOptions = [
  // OpenRouter models (use full OpenRouter model ID)
  { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku (fast)' },
  { value: 'anthropic/claude-3-sonnet', label: 'Claude 3 Sonnet' },
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (fast)' },
  { value: 'google/gemini-pro', label: 'Gemini Pro' },
  { value: 'mistralai/mistral-7b-instruct', label: 'Mistral 7B (free tier)' },
  // HuggingFace models (Inference API)
  { value: 'Qwen/Qwen2.5-7B-Instruct', label: 'Qwen 2.5 7B (free)' },
  { value: 'meta-llama/Llama-3-8B-Instruct', label: 'Llama 3 8B' },
]

function saveApiKey() {
  saving.value = true
  saved.value = false
  setTimeout(() => {
    saving.value = false
    saved.value = true
    setTimeout(() => { saved.value = false }, 2000)
  }, 500)
}

function clearAllData() {
  if (!confirm('Delete ALL data? This cannot be undone.')) return
  indexedDB.deleteDatabase('OpenLearnDB')
  localStorage.clear()
  location.reload()
}
</script>
<template>
  <div class="max-w-2xl mx-auto w-full px-6 py-8">
    <h1 class="text-2xl font-bold text-primary mb-8">Settings</h1>

    <!-- Appearance -->
    <section class="mb-8">
      <h2 class="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Appearance</h2>
      <div class="bg-white rounded-2xl border border-border overflow-hidden" style="box-shadow:0 1px 3px rgba(0,0,0,0.05)">
        <div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-canvas transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:#FEF3C7">
              <svg width="16" height="16" fill="none" stroke="#F59E0B" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              </svg>
            </div>
            <div>
              <div class="text-sm font-semibold" style="color:#111827">Theme</div>
              <div class="text-xs" style="color:#9CA3AF">Light · Dark · System</div>
            </div>
          </div>
          <svg width="14" height="14" fill="none" stroke="#D1D5DB" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
          </svg>
        </div>
      </div>
    </section>

    <!-- Spaced Repetition -->
    <section class="mb-8">
      <h2 class="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Learning</h2>
      <div class="bg-white rounded-2xl border border-border overflow-hidden" style="box-shadow:0 1px 3px rgba(0,0,0,0.05)">
        <div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-canvas transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:#E8F6F6">
              <svg width="16" height="16" fill="none" stroke="#66CCCC" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div>
              <div class="text-sm font-semibold" style="color:#111827">Spaced Repetition</div>
              <div class="text-xs" style="color:#9CA3AF">FSRS algorithm settings</div>
            </div>
          </div>
          <svg width="14" height="14" fill="none" stroke="#D1D5DB" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
          </svg>
        </div>
        <div style="border-top:1px solid #F3F4F6"/>
        <div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-canvas transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:#EDE9F6">
              <svg width="16" height="16" fill="none" stroke="#A891CC" stroke-width="2" viewBox="0 0 24 24">
                <rect x="2" y="5" width="14" height="16" rx="2"/><rect x="8" y="3" width="14" height="16" rx="2"/>
              </svg>
            </div>
            <div>
              <div class="text-sm font-semibold" style="color:#111827">Daily Review Goal</div>
              <div class="text-xs" style="color:#9CA3AF">20 cards per day</div>
            </div>
          </div>
          <svg width="14" height="14" fill="none" stroke="#D1D5DB" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
          </svg>
        </div>
      </div>
    </section>

    <!-- AI API -->
    <section class="mb-8">
      <h2 class="text-xs font-semibold uppercase tracking-wider text-muted mb-3">AI API</h2>
      <div class="bg-white rounded-2xl border border-border overflow-hidden" style="box-shadow:0 1px 3px rgba(0,0,0,0.05)">
        <!-- Provider selector -->
        <div class="px-5 pt-4 pb-3" style="border-bottom:1px solid #F3F4F6">
          <div class="text-xs font-semibold mb-2" style="color:#374151">Provider</div>
          <div class="flex gap-2">
            <button
              v-for="opt in providerOptions"
              :key="opt.value"
              @click="s.aiProvider = opt.value"
              class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              :style="s.aiProvider === opt.value
                ? { background: '#F97316', color: 'white' }
                : { background: '#F3F4F6', color: '#6B7280' }"
            >{{ opt.label }}</button>
          </div>
        </div>
        <!-- API Key input -->
        <div class="px-5 py-4" style="border-bottom:1px solid #F3F4F6">
          <div class="text-xs font-semibold mb-2" style="color:#374151">
            {{ s.aiProvider === 'openrouter' ? 'OpenRouter API Key' : 'HuggingFace Token' }}
          </div>
          <input
            v-model="s.openrouterApiKey"
            :type="s.aiProvider === 'openrouter' ? 'password' : 'text'"
            :placeholder="s.aiProvider === 'openrouter' ? 'sk-or-v1-...' : 'hf_...'"
            class="w-full px-4 py-2.5 rounded-xl text-sm outline-none border bg-white focus:border-orange-400 transition-colors"
            style="color:#111827; border-color:#E5E7EB"
          />
          <div class="text-xs mt-1.5" style="color:#9CA3AF">
            Get free key: {{ s.aiProvider === 'openrouter' ? 'openrouter.ai/keys' : 'huggingface.co/settings/tokens' }}
          </div>
        </div>
        <!-- Model selector -->
        <div class="px-5 py-4">
          <div class="text-xs font-semibold mb-2" style="color:#374151">Model</div>
          <select
            v-model="s.aiModel"
            class="w-full px-4 py-2.5 rounded-xl text-sm outline-none border bg-white focus:border-orange-400 transition-colors"
            style="color:#111827; border-color:#E5E7EB"
          >
            <option v-for="opt in modelOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <div class="flex items-center justify-between mt-3">
            <div class="text-xs" style="color:#9CA3AF">Free: Qwen 2.5 7B (HuggingFace) or Claude Haiku (OpenRouter trial)</div>
            <button
              @click="saveApiKey"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all"
              style="background:#F97316"
            >
              {{ saving ? 'Saving...' : saved ? '✓ Saved' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Data -->
    <section class="mb-8">
      <h2 class="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Data</h2>
      <div class="bg-white rounded-2xl border border-border overflow-hidden" style="box-shadow:0 1px 3px rgba(0,0,0,0.05)">
        <div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-canvas transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:#FEE2E2">
              <svg width="16" height="16" fill="none" stroke="#EF4444" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
            </div>
            <div>
              <div class="text-sm font-semibold" style="color:#111827">Export Data</div>
              <div class="text-xs" style="color:#9CA3AF">Download all cards and notebooks</div>
            </div>
          </div>
          <svg width="14" height="14" fill="none" stroke="#D1D5DB" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
          </svg>
        </div>
        <div style="border-top:1px solid #F3F4F6"/>
        <div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-canvas transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:#FEE2E2">
              <svg width="16" height="16" fill="none" stroke="#EF4444" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
              </svg>
            </div>
            <div>
              <div class="text-sm font-semibold" style="color:#EF4444">Import Data</div>
              <div class="text-xs" style="color:#9CA3AF">Import from Anki, CSV, JSON</div>
            </div>
          </div>
          <svg width="14" height="14" fill="none" stroke="#D1D5DB" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
          </svg>
        </div>
      </div>
    </section>

    <!-- About -->
    <section>
      <h2 class="text-xs font-semibold uppercase tracking-wider text-muted mb-3">About</h2>
      <div class="bg-white rounded-2xl border border-border px-5 py-4" style="box-shadow:0 1px 3px rgba(0,0,0,0.05)">
        <div class="text-sm font-semibold" style="color:#111827">OpenLearn</div>
        <div class="text-xs mt-0.5" style="color:#9CA3AF">Version 0.1.0</div>
      </div>
    </section>
  </div>
</template>

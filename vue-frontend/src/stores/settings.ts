import { reactive, watch } from 'vue'

export interface AppSettings {
  openrouterApiKey: string
  aiModel: string  // e.g. "openrouter/anthropic/claude-3-haiku" or "huggingface/..."
  aiProvider: 'openrouter' | 'huggingface'
  hfToken: string
}

const STORAGE_KEY = 'openlearn_settings'

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    openrouterApiKey: '',
    aiModel: 'openrouter/anthropic/claude-3-haiku',
    aiProvider: 'openrouter',
    hfToken: '',
  }
}

export const settings = reactive<AppSettings>(loadSettings())

watch(settings, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function getSettings() { return settings }

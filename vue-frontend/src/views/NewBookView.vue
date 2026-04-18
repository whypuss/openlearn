<template>
  <div class="max-w-2xl mx-auto w-full px-6 py-8">

    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-primary">New Book</h1>
        <p class="text-sm text-muted mt-0.5">Choose what to create</p>
      </div>
      <router-link to="/" class="text-sm text-secondary hover:text-primary">← Cancel</router-link>
    </div>

    <!-- Step 1: Feature grid -->
    <div v-if="step === 'feature'">
      <div class="grid grid-cols-2 gap-4">
        <button
          v-for="f in features"
          :key="f.id"
          @click="selectFeature(f.id)"
          class="bg-white rounded-2xl p-6 text-center transition-all border-2 border-transparent hover:border-orange-200"
          style="box-shadow:0 1px 3px rgba(0,0,0,0.08)"
        >
          <div class="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" :style="{ background: f.bg, color: f.color }">
            <component :is="f.icon" />
          </div>
          <div class="font-semibold text-sm mb-0.5" style="color:#111827">{{ f.label }}</div>
          <div class="text-xs" style="color:#9CA3AF">{{ f.sub }}</div>
        </button>
      </div>
    </div>

    <!-- Step 2: Book name -->
    <div v-else>
      <!-- Feature recap -->
      <div class="flex items-center gap-3 mb-6 p-4 bg-white rounded-2xl border border-border">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ background: selectedFeatureObj?.bg, color: selectedFeatureObj?.color }">
          <component :is="selectedFeatureObj?.icon" />
        </div>
        <div>
          <div class="text-sm font-semibold" style="color:#111827">{{ selectedFeatureObj?.label }}</div>
          <div class="text-xs" style="color:#9CA3AF">{{ selectedFeatureObj?.sub }}</div>
        </div>
        <button @click="step = 'feature'" class="ml-auto text-xs px-3 py-1.5 rounded-lg bg-canvas text-secondary">
          Change
        </button>
      </div>

      <h2 class="text-xl font-bold mb-1" style="color:#111827">Name your book</h2>
      <p class="text-sm mb-6" style="color:#9CA3AF">Give it a name to get started</p>

      <div class="bg-white rounded-2xl p-5 border border-border">
        <input
          v-model="bookName"
          autofocus
          placeholder="e.g. Japanese JLPT N5 Vocabulary"
          class="w-full px-4 py-3 rounded-xl text-sm outline-none bg-canvas border border-border focus:border-accent transition-colors"
          style="color:#111827"
          @keyup.enter="createBook"
        />

        <div class="flex gap-3 mt-5">
          <button
            @click="step = 'feature'"
            class="flex-1 py-3 rounded-xl text-sm font-medium bg-canvas text-secondary transition-all"
          >
            ← Back
          </button>
          <button
            @click="createBook"
            :disabled="!bookName.trim() || creating"
            class="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style="background:#F97316; cursor:bookName.trim() ? 'pointer' : 'not-allowed'"
          >
            {{ creating ? 'Creating...' : 'Create Book →' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { createBook as dbCreateBook } from '../lib/db'

const router = useRouter()
const step = ref<'feature' | 'name'>('feature')
const selectedFeature = ref<string | null>(null)
const bookName = ref('')
const creating = ref(false)

// ─── SVG Icon components ──────────────────────────────
const FlashIcon = () => h('svg', { width: 26, height: 26, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, viewBox: '0 0 24 24' }, [
  h('rect', { x: 2, y: 5, width: 14, height: 16, rx: 2 }),
  h('rect', { x: 8, y: 3, width: 14, height: 16, rx: 2 }),
  h('line', { x1: 12, y1: 8, x2: 18, y2: 8 }),
  h('line', { x1: 12, y1: 12, x2: 16, y2: 12 }),
])

const QuizIcon = () => h('svg', { width: 26, height: 26, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, viewBox: '0 0 24 24' }, [
  h('path', { d: 'M9 11l3 3L22 4' }),
  h('path', { d: 'M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' }),
])

const MindIcon = () => h('svg', { width: 26, height: 26, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, viewBox: '0 0 24 24' }, [
  h('circle', { cx: 12, cy: 12, r: 3 }),
  h('circle', { cx: 4, cy: 6, r: 2 }),
  h('circle', { cx: 20, cy: 6, r: 2 }),
  h('circle', { cx: 4, cy: 18, r: 2 }),
  h('circle', { cx: 20, cy: 18, r: 2 }),
  h('line', { x1: 9.5, y1: 10, x2: 6, y2: 7.5 }),
  h('line', { x1: 14.5, y1: 10, x2: 18, y2: 7.5 }),
  h('line', { x1: 9.5, y1: 14, x2: 6, y2: 16.5 }),
  h('line', { x1: 14.5, y1: 14, x2: 18, y2: 16.5 }),
])

const SummaryIcon = () => h('svg', { width: 26, height: 26, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, viewBox: '0 0 24 24' }, [
  h('line', { x1: 3, y1: 6, x2: 21, y2: 6 }),
  h('line', { x1: 3, y1: 10, x2: 16, y2: 10 }),
  h('line', { x1: 3, y1: 14, x2: 19, y2: 14 }),
  h('line', { x1: 3, y1: 18, x2: 12, y2: 18 }),
])

const features = [
  { id: 'flashcards', label: '生成卡片', sub: 'Flashcards', color: '#66CCCC', bg: '#E8F6F6', icon: FlashIcon },
  { id: 'quiz', label: '測試題', sub: 'Practice Test', color: '#F59E0B', bg: '#FEF3C7', icon: QuizIcon },
  { id: 'mindmap', label: '心智圖', sub: 'Mind Map', color: '#A891CC', bg: '#EDE9F6', icon: MindIcon },
  { id: 'summary', label: 'AI 總結', sub: 'Summary', color: '#B2D8B2', bg: '#EDF7ED', icon: SummaryIcon },
]

const selectedFeatureObj = computed(() => features.find(f => f.id === selectedFeature.value))

function selectFeature(id: string) {
  selectedFeature.value = id
  step.value = 'name'
}

async function createBook() {
  if (!bookName.value.trim() || creating.value) return
  creating.value = true
  try {
    const book = await dbCreateBook(bookName.value.trim(), '', '#F97316')
    router.push(`/books/${book.id}`)
  } finally {
    creating.value = false
  }
}
</script>

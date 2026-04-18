<template>
  <div class="min-h-screen flex flex-col" style="background:#F3F4F6; height:100vh; overflow:hidden">

    <!-- ── Header ─────────────────────────────────────────── -->
    <header class="bg-white shrink-0 flex items-center px-4" style="height:52px; border-bottom:1px solid #E5E7EB">
      <router-link to="/" class="text-sm shrink-0 mr-3" style="color:#9CA3AF">←</router-link>
      <div class="w-8 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 mr-3" :style="{ background: book?.coverColor || '#F97316' }">
        {{ (book?.name || 'B').charAt(0).toUpperCase() }}
      </div>
      <span class="font-semibold text-sm truncate flex-1" style="color:#111827">{{ book?.name || '...' }}</span>
    </header>

    <!-- ── Tab bar ─────────────────────────────────────────── -->
    <div class="bg-white shrink-0 flex" style="border-bottom:2px solid #E5E7EB">
      <button
        v-for="tab in (['source', 'studio'] as const)"
        :key="tab"
        @click="activeTab = tab"
        class="flex-1 py-3 text-sm font-semibold transition-all"
        :style="activeTab === tab
          ? { color: '#F97316', borderBottom: '2px solid #F97316', marginBottom: '-2px' }
          : { color: '#9CA3AF', borderBottom: '2px solid transparent', marginBottom: '-2px' }"
      >
        {{ tab === 'source' ? 'Source' : 'Studio' }}
      </button>
    </div>

    <!-- ── Main content ──────────────────────────────────── -->
    <div class="flex-1 overflow-hidden">

      <!-- ── Source Tab ─────────────────────────────────── -->
      <div v-if="activeTab === 'source'" class="h-full flex flex-col overflow-hidden">

        <!-- Drop zone / Upload -->
        <div class="p-4" style="border-bottom:1px solid #F3F4F6">
          <input ref="fileInput" type="file" accept=".pdf" class="hidden" @change="handleFileUpload" />
          <div
            @click="triggerFileUpload"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleFileDrop"
            class="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-medium border-2 border-dashed transition-all cursor-pointer"
            :style="isDragging
              ? { borderColor: '#F97316', background: '#FFF7ED', color: '#F97316' }
              : { borderColor: '#E5E7EB', background: '#FAFAFA', color: '#6B7280' }"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            Drop PDF here or tap to upload
          </div>
        </div>

        <!-- Add link -->
        <div class="px-4 py-3" style="border-bottom:1px solid #F3F4F6">
          <div class="flex gap-2">
            <input
              v-model="linkInput"
              placeholder="Paste a URL..."
              class="flex-1 px-3 py-2.5 rounded-xl text-xs outline-none border bg-white focus:border-accent transition-colors"
              style="color:#111827; min-width:0; border-color:#E5E7EB"
              @keyup.enter="addLink"
            />
            <button
              @click="addLink"
              :disabled="!linkInput.trim()"
              class="px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-40"
              style="background:#F97316"
            >
              Add
            </button>
          </div>
        </div>

        <!-- Source list -->
        <div class="flex-1 overflow-y-auto py-2">
          <div v-if="sources.length === 0" class="flex flex-col items-center justify-center py-16 text-center px-6">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style="background:#FFF7ED">
              <svg width="22" height="22" fill="none" stroke="#F97316" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
              </svg>
            </div>
            <p class="text-sm font-medium mb-1" style="color:#374151">No sources yet</p>
            <p class="text-xs" style="color:#9CA3AF">Upload a PDF or paste a link above</p>
          </div>

          <div v-else>
            <div class="px-4 py-2">
              <span class="text-xs font-semibold" style="color:#9CA3AF">{{ sources.length }} source{{ sources.length !== 1 ? 's' : '' }}</span>
            </div>
            <div
              v-for="src in sources"
              :key="src.id"
              class="flex items-start gap-3 px-4 py-3 transition-all hover:bg-white cursor-pointer group"
              style="border-bottom:1px solid #F9FAFB"
            >
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                :style="src.type === 'pdf' ? { background:'#FEE2E2', color:'#EF4444' } : { background:'#DBEAFE', color:'#2563EB' }">
                <svg v-if="src.type === 'pdf'" width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                </svg>
                <svg v-else width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate" style="color:#111827">{{ src.title }}</p>
                <p class="text-xs mt-0.5 truncate" style="color:#9CA3AF">{{ src.url || (src.type === 'pdf' ? 'PDF document' : 'Web content') }}</p>
              </div>
              <button
                @click.stop="removeSource(src.id!)"
                class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all shrink-0"
                style="background:#FEF2F2; color:#EF4444"
              >
                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Generate button -->
        <div v-if="sources.length > 0" class="p-4" style="border-top:1px solid #E5E7EB">
          <button
            @click="activeTab = 'studio'"
            class="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style="background:#F97316"
          >
            Generate → {{ sources.length }} source{{ sources.length !== 1 ? 's' : '' }}
          </button>
        </div>
      </div>

      <!-- ── Studio Tab ─────────────────────────────────── -->
      <div v-else class="h-full overflow-y-auto pb-4">

        <!-- Empty state -->
        <div v-if="sources.length === 0" class="flex flex-col items-center justify-center py-20 text-center px-6">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style="background:#FFF7ED">
            <svg width="22" height="22" fill="none" stroke="#F97316" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
            </svg>
          </div>
          <p class="text-sm font-medium mb-1" style="color:#374151">No sources yet</p>
          <p class="text-xs mb-4" style="color:#9CA3AF">Add sources in the Source tab first</p>
          <button @click="activeTab = 'source'" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style="background:#F97316">
            Go to Source →
          </button>
        </div>

        <!-- Ready banner -->
        <div v-else-if="!activeStudio" class="p-4">
          <div class="bg-white rounded-2xl p-5 mb-4" style="border:1px solid #F97316; box-shadow:0 0 0 3px #FFF0E6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:#FFF0E6">
                <svg width="18" height="18" fill="none" stroke="#F97316" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-bold" style="color:#111827">Ready to generate</p>
                <p class="text-xs" style="color:#9CA3AF">{{ sources.length }} source{{ sources.length !== 1 ? 's' : '' }} loaded</p>
              </div>
            </div>
          </div>

          <!-- 2x2 grid -->
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="s in studios"
              :key="s.id"
              @click="openStudio(s.id)"
              class="bg-white rounded-2xl p-4 text-left transition-all hover:border-accent"
              style="border:2px solid transparent; box-shadow:0 1px 3px rgba(0,0,0,0.06)"
            >
              <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3" :style="{ background: s.bg }">
                <svg v-if="s.id === 'flashcards'" width="18" height="18" fill="none" stroke="#66CCCC" stroke-width="2" viewBox="0 0 24 24">
                  <rect x="2" y="5" width="14" height="16" rx="2"/><rect x="8" y="3" width="14" height="16" rx="2"/>
                  <line x1="12" y1="9" x2="18" y2="9"/><line x1="12" y1="13" x2="16" y2="13"/>
                </svg>
                <svg v-else-if="s.id === 'quiz'" width="18" height="18" fill="none" stroke="#F59E0B" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <svg v-else-if="s.id === 'mindmap'" width="18" height="18" fill="none" stroke="#A891CC" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/>
                  <line x1="9.5" y1="10" x2="6" y2="7.5"/><line x1="14.5" y1="10" x2="18" y2="7.5"/>
                  <line x1="9.5" y1="14" x2="6" y2="16.5"/><line x1="14.5" y1="14" x2="18" y2="16.5"/>
                </svg>
                <svg v-else width="18" height="18" fill="none" stroke="#16A34A" stroke-width="2" viewBox="0 0 24 24">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="10" x2="16" y2="10"/>
                  <line x1="3" y1="14" x2="19" y2="14"/><line x1="3" y1="18" x2="12" y2="18"/>
                </svg>
              </div>
              <div class="font-bold text-sm mb-0.5" style="color:#111827">{{ s.label }}</div>
              <div class="text-xs" style="color:#9CA3AF">{{ s.desc }}</div>
            </button>
          </div>
        </div>

        <!-- Active Studio panel -->
        <div v-else class="px-4 pb-4">
          <div class="bg-white rounded-2xl overflow-hidden" style="border:1px solid #E5E7EB; box-shadow:0 1px 3px rgba(0,0,0,0.06)">
            <!-- Studio panel header -->
            <div class="flex items-center gap-3 px-4 py-3" style="border-bottom:1px solid #F3F4F6">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" :style="{ background: studios.find(s=>s.id===activeStudio)?.bg }">
                <svg v-if="activeStudio === 'flashcards'" width="15" height="15" fill="none" stroke="#66CCCC" stroke-width="2" viewBox="0 0 24 24">
                  <rect x="2" y="5" width="14" height="16" rx="2"/><rect x="8" y="3" width="14" height="16" rx="2"/>
                  <line x1="12" y1="9" x2="18" y2="9"/><line x1="12" y1="13" x2="16" y2="13"/>
                </svg>
                <svg v-else-if="activeStudio === 'quiz'" width="15" height="15" fill="none" stroke="#F59E0B" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <svg v-else-if="activeStudio === 'mindmap'" width="15" height="15" fill="none" stroke="#A891CC" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/>
                </svg>
                <svg v-else width="15" height="15" fill="none" stroke="#16A34A" stroke-width="2" viewBox="0 0 24 24">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="10" x2="16" y2="10"/>
                </svg>
              </div>
              <div class="flex-1">
                <div class="font-semibold text-sm" style="color:#111827">{{ studios.find(s=>s.id===activeStudio)?.label }}</div>
                <div class="text-xs" style="color:#9CA3AF">{{ studios.find(s=>s.id===activeStudio)?.desc }}</div>
              </div>
              <button @click="activeStudio = null; promptText = ''" class="p-2 rounded-xl" style="color:#9CA3AF; background:#F9FAFB">
                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Flashcards panel -->
            <div v-if="activeStudio === 'flashcards'" class="p-4">
              <textarea
                v-model="promptText"
                rows="3"
                placeholder="Describe the cards you want, or leave blank for auto-generation..."
                class="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none border bg-canvas focus:border-accent transition-colors"
                style="color:#111827; border-color:#E5E7EB"
              />
              <button @click="runFlashcards" :disabled="generating" class="mt-3 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all" style="background:#F97316">
                {{ generating ? 'Generating...' : 'Generate Flashcards →' }}
              </button>
              <div v-if="generatedCards.length > 0" class="mt-4 pt-4" style="border-top:1px solid #F3F4F6">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-bold" style="color:#374151">{{ generatedCards.length }} cards generated</span>
                  <div class="flex gap-2">
                    <button @click="saveCards" class="text-xs px-3 py-1.5 rounded-lg font-semibold text-white" style="background:#F97316">Save</button>
                    <button @click="generatedCards = []" class="text-xs px-3 py-1.5 rounded-lg font-medium" style="background:#F3F4F6; color:#6B7280">Discard</button>
                  </div>
                </div>
                <div class="space-y-2 max-h-52 overflow-y-auto">
                  <div v-for="(card, i) in generatedCards" :key="i" class="bg-canvas rounded-xl p-3">
                    <div class="text-xs font-semibold mb-1" style="color:#111827">{{ i+1 }}. {{ card.front }}</div>
                    <div class="text-xs" style="color:#9CA3AF">{{ card.back }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quiz panel -->
            <div v-else-if="activeStudio === 'quiz'" class="p-4">
              <textarea
                v-model="promptText"
                rows="3"
                placeholder="e.g. Grammar questions, N3 level..."
                class="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none border bg-canvas focus:border-accent transition-colors"
                style="color:#111827; border-color:#E5E7EB"
              />
              <button @click="runQuiz" :disabled="generating" class="mt-3 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all" style="background:#F59E0B">
                {{ generating ? 'Generating...' : 'Generate Questions →' }}
              </button>
            </div>

            <!-- Mindmap panel -->
            <div v-else-if="activeStudio === 'mindmap'" class="p-4">
              <button @click="runMindmap" :disabled="generating" class="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all" style="background:#A891CC">
                {{ generating ? 'Generating...' : 'Generate Mind Map →' }}
              </button>
            </div>

            <!-- Summary panel -->
            <div v-else-if="activeStudio === 'summary'" class="p-4">
              <button @click="runSummary" :disabled="generating" class="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all" style="background:#16A34A">
                {{ generating ? 'Generating...' : 'Generate Summary →' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Bottom nav ─────────────────────────────────── -->
    <nav class="bg-white shrink-0 flex" style="border-top:2px solid #E5E7EB; padding-bottom:env(safe-area-inset-bottom)">
      <button
        v-for="item in bottomNav"
        :key="item.id"
        @click="handleBottomNav(item.id)"
        class="flex-1 flex flex-col items-center py-2.5 transition-all"
        :style="activeBottomNav === item.id ? { color: '#F97316' } : { color: '#9CA3AF' }"
      >
        <!-- Source icon -->
        <svg v-if="item.id === 'source'" width="22" height="22" fill="none" stroke="currentColor" :stroke-width="activeBottomNav === 'source' ? 2 : 1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
        </svg>
        <!-- Studio icon -->
        <svg v-else-if="item.id === 'studio'" width="22" height="22" fill="none" stroke="currentColor" :stroke-width="activeBottomNav === 'studio' ? 2 : 1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
        </svg>
        <!-- Settings icon -->
        <svg v-else width="22" height="22" fill="none" stroke="currentColor" :stroke-width="activeBottomNav === 'settings' ? 2 : 1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.214 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span class="text-xs font-medium mt-1">{{ item.label }}</span>
      </button>
    </nav>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getBook, listDecks, getSourcesForBook,
  addSource, deleteSource as dbDeleteSource, createCard,
  type Book, type Deck, type Source,
} from '../lib/db'

const route = useRoute()
const router = useRouter()
const bookId = parseInt(route.params.id as string, 10)

const book = ref<Book | null>(null)
const sources = ref<Source[]>([])
const bookDecks = ref<Deck[]>([])
const loading = ref(true)
const activeTab = ref<'source' | 'studio'>('source')
const activeBottomNav = ref<'source' | 'studio' | 'settings'>('source')
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const linkInput = ref('')
const generating = ref(false)
const activeStudio = ref<string | null>(null)
const promptText = ref('')
const generatedCards = ref<Array<{front: string; back: string}>>([])

const studios = [
  { id: 'flashcards', label: 'Flashcards', desc: 'Q&A cards', bg: '#E8F6F6' },
  { id: 'quiz', label: 'Practice Test', desc: 'Multiple choice', bg: '#FEF3C7' },
  { id: 'mindmap', label: 'Mind Map', desc: 'Concept map', bg: '#EDE9F6' },
  { id: 'summary', label: 'AI Summary', desc: 'Key points', bg: '#DCFCE7' },
]

const bottomNav = [
  { id: 'source' as const, label: 'Source' },
  { id: 'studio' as const, label: 'Studio' },
  { id: 'settings' as const, label: 'Settings' },
]

onMounted(async () => {
  const [b, decks] = await Promise.all([getBook(bookId), listDecks()])
  book.value = b ?? null
  bookDecks.value = decks.filter(d => b?.deckIds.includes(d.id!))
  sources.value = await getSourcesForBook(bookId)
  loading.value = false
})

function handleBottomNav(id: string) {
  activeBottomNav.value = id as typeof activeBottomNav.value
  if (id === 'settings') {
    router.push('/settings')
  } else {
    activeTab.value = id as 'source' | 'studio'
  }
}

function triggerFileUpload() { fileInput.value?.click() }

async function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  await savePdfFile(file)
  ;(e.target as HTMLInputElement).value = ''
}

async function handleFileDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file?.name.endsWith('.pdf')) return
  await savePdfFile(file)
}

async function savePdfFile(file: File) {
  const url = URL.createObjectURL(file)
  const src = await addSource(bookId, 'pdf', url, file.name, '')
  sources.value = [src, ...sources.value]
}

async function addLink() {
  if (!linkInput.value.trim()) return
  let url = linkInput.value.trim()
  if (!url.startsWith('http')) url = 'https://' + url
  const type: Source['type'] = /youtube\.com|youtu\.be/.test(url) ? 'youtube' : 'web'
  const title = url.length > 50 ? url.substring(0, 47) + '...' : url
  const src = await addSource(bookId, type, url, title, '')
  sources.value = [src, ...sources.value]
  linkInput.value = ''
}

async function removeSource(id: number) {
  await dbDeleteSource(id)
  sources.value = sources.value.filter(s => s.id !== id)
}

function openStudio(type: string) {
  activeStudio.value = type
  promptText.value = ''
  generatedCards.value = []
}

async function runFlashcards() {
  generating.value = true
  await new Promise(r => setTimeout(r, 1800))
  generatedCards.value = [
    { front: 'What is spaced repetition?', back: 'A learning technique with increasing intervals between reviews.' },
    { front: 'What is active recall?', back: 'The practice of stimulating memory during learning, rather than passive review.' },
    { front: 'What is the Forgetting Curve?', back: 'The correlation showing memory retention declines exponentially without review.' },
  ]
  generating.value = false
}

async function runQuiz() {
  generating.value = true
  await new Promise(r => setTimeout(r, 1800))
  generating.value = false
}

async function runMindmap() {
  generating.value = true
  await new Promise(r => setTimeout(r, 1800))
  generating.value = false
}

async function runSummary() {
  generating.value = true
  await new Promise(r => setTimeout(r, 1800))
  generating.value = false
}

async function saveCards() {
  if (!bookDecks.value[0]?.id) return
  const deckId = bookDecks.value[0].id
  for (const card of generatedCards.value) {
    await createCard({
      deckId, front: card.front, back: card.back,
      hint: '', tags: [], sourceId: 0,
      fsrsState: '{}', dueDate: null, intervalSecs: 0, easeFactor: 2.5,
    })
  }
  generatedCards.value = []
  activeStudio.value = null
}
</script>

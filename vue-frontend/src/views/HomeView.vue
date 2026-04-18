<template>
  <div class="h-screen flex flex-col" style="background:#F3F4F6; overflow:hidden">

    <!-- ── Header ─────────────────────────────────────────── -->
    <header class="bg-white shrink-0 flex items-center px-4" style="height:52px; border-bottom:1px solid #E5E7EB">
      <span class="font-bold text-base" style="color:#111827">Library</span>
      <div class="ml-auto flex items-center gap-2">
        <router-link to="/settings" class="p-2 rounded-xl transition-all hover:bg-canvas" style="color:#9CA3AF">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.332.183-.582.495-.644.869l-.214 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </router-link>
        <button @click="openNewBookModal" class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all" style="background:#F97316">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          New Book
        </button>
      </div>
    </header>

    <!-- ── Main ─────────────────────────────────────────── -->
    <div class="flex-1 flex overflow-hidden">

      <!-- Left: Book list -->
      <div
        class="shrink-0 overflow-y-auto transition-all"
        :class="isDesktop ? 'w-56' : 'w-full'"
        :style="isDesktop
          ? { borderRight: '1px solid #E5E7EB', background: '#FAFAFA' }
          : selectedBook && showMobileBook ? { display: 'none' } : {}"
      >
        <div v-if="books.length === 0" class="text-center py-12">
          <p class="text-xs" style="color:#9CA3AF">No books yet</p>
        </div>
        <div class="space-y-1 p-3">
          <button
            v-for="book in books"
            :key="book.id"
            @click="selectBook(book)"
            class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all"
            :style="selectedBook?.id === book.id
              ? { background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
              : { background: 'transparent' }"
          >
            <div class="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
              :style="{ background: book.coverColor || '#F97316' }">
              {{ book.name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-semibold truncate" :style="{ color: selectedBook?.id === book.id ? '#111827' : '#374151' }">
                {{ book.name }}
              </div>
              <div class="text-xs truncate" style="color:#9CA3AF">{{ book.deckIds?.length || 0 }} deck{{ (book.deckIds?.length || 0) !== 1 ? 's' : '' }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Right: Book panel -->
      <div
        v-if="selectedBook"
        class="flex-1 flex flex-col overflow-hidden"
        :class="!isDesktop ? 'w-full' : ''"
        :style="!isDesktop && showMobileBook ? {} : !isDesktop ? { display: 'none' } : {}"
      >
        <!-- Mobile back + delete -->
        <div v-if="!isDesktop" class="bg-white shrink-0 flex items-center px-4" style="height:52px; border-bottom:1px solid #E5E7EB">
          <button @click="showMobileBook = false" class="flex items-center gap-1 text-sm shrink-0" style="color:#6B7280">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
            </svg>
          </button>
          <span class="flex-1 font-semibold text-sm truncate text-center" style="color:#111827">{{ selectedBook.name }}</span>
          <button @click="deleteTarget = selectedBook" class="p-2 rounded-xl shrink-0" style="color:#FCA5A5">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
            </svg>
          </button>
        </div>

        <!-- Book header (desktop) -->
        <div v-if="isDesktop" class="bg-white shrink-0 flex items-center px-5" style="height:52px; border-bottom:1px solid #E5E7EB">
          <div class="w-8 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 mr-3"
            :style="{ background: selectedBook.coverColor || '#F97316' }">
            {{ selectedBook.name.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-sm truncate" style="color:#111827">{{ selectedBook.name }}</div>
            <div class="text-xs" style="color:#9CA3AF">{{ bookDecks.length }} deck{{ bookDecks.length !== 1 ? 's' : '' }}</div>
          </div>
          <button @click="deleteTarget = selectedBook" class="p-2 rounded-xl transition-all hover:bg-red-50" style="color:#FCA5A5">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
            </svg>
          </button>
        </div>

        <!-- 3-tab bar: Source / Studio / Decks -->
        <div class="bg-white shrink-0 flex" style="border-bottom:2px solid #E5E7EB">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex-1 py-3 text-sm font-semibold transition-all relative"
            :style="activeTab === tab.id
              ? { color: '#F97316', borderBottom: '2px solid #F97316', marginBottom: '-2px' }
              : { color: '#9CA3AF', borderBottom: '2px solid transparent', marginBottom: '-2px' }"
          >
            {{ tab.label }}
            <span v-if="tab.id === 'decks' && bookDecks.length > 0"
              class="ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold"
              style="background:#FFF0E6; color:#F97316">
              {{ bookDecks.length }}
            </span>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-hidden flex flex-col">

          <!-- ══════════════ SOURCE TAB ══════════════ -->
          <div v-if="activeTab === 'source'" class="flex-1 overflow-y-auto">

            <!-- Upload progress bar -->
            <div v-if="uploadProgress !== null" class="px-4 pt-4">
              <div class="bg-white rounded-2xl p-4" style="border:1px solid #E5E7EB">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-medium" style="color:#374151">Uploading PDF...</span>
                  <span class="text-xs font-semibold" style="color:#F97316">{{ uploadProgress }}%</span>
                </div>
                <div class="w-full rounded-full h-1.5" style="background:#F3F4F6">
                  <div class="h-full rounded-full transition-all" style="background:#F97316; width:0%" :style="{ width: uploadProgress + '%' }"/>
                </div>
              </div>
            </div>

            <!-- Drop zone -->
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
                  class="flex-1 px-3 py-2.5 rounded-xl text-xs outline-none border bg-white focus:border-orange-400 transition-colors"
                  style="color:#111827; min-width:0; border-color:#E5E7EB"
                  @keyup.enter="addLink"
                />
                <button @click="addLink" :disabled="!linkInput.trim()" class="px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-40" style="background:#F97316">Add</button>
              </div>
            </div>

            <!-- Source list -->
            <div class="py-2">
              <div v-if="sources.length === 0" class="flex flex-col items-center justify-center py-12 text-center px-6">
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
                    <p class="text-xs mt-0.5 truncate" style="color:#9CA3AF">
                      <span v-if="src.content && src.content.length > 10" style="color:#10B981">✓ Text extracted</span>
                      <span v-else>{{ src.url || (src.type === 'pdf' ? 'PDF (no text extracted)' : 'Web content') }}</span>
                    </p>
                  </div>
                  <button @click.stop="removeSource(src.id!)" class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all shrink-0" style="background:#FEF2F2; color:#EF4444">
                    <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Generate from sources -->
            <div v-if="sources.length > 0" class="px-4 py-4" style="border-top:1px solid #E5E7EB">
              <button @click="activeTab = 'studio'" class="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all" style="background:#F97316">
                Generate → {{ sources.length }} source{{ sources.length !== 1 ? 's' : '' }}
              </button>
            </div>
          </div>

          <!-- ══════════════ STUDIO TAB ══════════════ -->
          <div v-else-if="activeTab === 'studio'" class="flex-1 overflow-y-auto pb-6">

            <!-- No sources -->
            <div v-if="sources.length === 0" class="flex flex-col items-center justify-center py-16 text-center px-6">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style="background:#FFF7ED">
                <svg width="22" height="22" fill="none" stroke="#F97316" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
                </svg>
              </div>
              <p class="text-sm font-medium mb-1" style="color:#374151">No sources yet</p>
              <p class="text-xs mb-4" style="color:#9CA3AF">Add sources in the Source tab first</p>
              <button @click="activeTab = 'source'" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style="background:#F97316">Go to Source →</button>
            </div>

            <!-- Studio picker -->
            <div v-else-if="!activeStudio" class="p-4">
              <!-- Sources summary -->
              <div class="bg-white rounded-2xl p-4 mb-4" style="border:1px solid #F97316; box-shadow:0 0 0 3px #FFF0E6">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:#FFF0E6">
                    <svg width="18" height="18" fill="none" stroke="#F97316" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-bold" style="color:#111827">Ready — {{ sources.length }} source{{ sources.length !== 1 ? 's' : '' }} loaded</p>
                    <p class="text-xs" style="color:#9CA3AF">{{ pdfSourceCount }} PDF{{ pdfSourceCount !== 1 ? 's' : '' }}, {{ webSourceCount }} link{{ webSourceCount !== 1 ? 's' : '' }}</p>
                  </div>
                </div>
              </div>

              <!-- 2x2 grid -->
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="s in studios"
                  :key="s.id"
                  @click="openStudio(s.id)"
                  class="bg-white rounded-2xl p-4 text-left transition-all"
                  style="border:2px solid transparent; box-shadow:0 1px 3px rgba(0,0,0,0.06)"
                >
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3" :style="{ background: s.bg }">
                    <svg v-if="s.id === 'flashcards'" width="18" height="18" fill="none" stroke="#66CCCC" stroke-width="2" viewBox="0 0 24 24">
                      <rect x="2" y="5" width="14" height="16" rx="2"/><rect x="8" y="3" width="14" height="16" rx="2"/>
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

              <!-- Flashcards -->
              <div v-if="activeStudio === 'flashcards'" class="bg-white rounded-2xl overflow-hidden" style="border:1px solid #E5E7EB">
                <div class="flex items-center gap-3 px-4 py-3" style="border-bottom:1px solid #F3F4F6">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:#E8F6F6">
                    <svg width="15" height="15" fill="none" stroke="#66CCCC" stroke-width="2" viewBox="0 0 24 24">
                      <rect x="2" y="5" width="14" height="16" rx="2"/><rect x="8" y="3" width="14" height="16" rx="2"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-sm" style="color:#111827">Flashcards</div>
                    <div class="text-xs" style="color:#9CA3AF">From: {{ sources.map(s => s.title).join(', ') }}</div>
                  </div>
                  <button @click="activeStudio = null" class="p-2 rounded-xl" style="color:#9CA3AF; background:#F9FAFB">
                    <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <div class="p-4">
                  <!-- Language selector -->
                  <div class="flex items-center gap-2 mb-3">
                    <span class="text-xs font-semibold" style="color:#9CA3AF">Language:</span>
                    <div class="flex gap-1.5">
                      <button v-for="lang in [{v:'zh-TW',l:'繁中'},{v:'zh-CN',l:'简中'},{v:'en',l:'EN'},{v:'ja',l:'日'},{v:'ko',l:'韓'}]" :key="lang.v"
                        @click="studioLang = lang.v"
                        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        :style="studioLang === lang.v ? {background:'#F97316',color:'white'} : {background:'#F3F4F6',color:'#6B7280'}"
                      >{{ lang.l }}</button>
                    </div>
                  </div>
                  <textarea
                    v-model="promptText"
                    rows="3"
                    placeholder="Describe the cards, or leave blank to auto-generate from sources..."
                    class="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none border bg-canvas focus:border-orange-400 transition-colors"
                    style="color:#111827; border-color:#E5E7EB"
                  />
                  <button @click="runFlashcards" :disabled="generating" class="mt-3 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50" style="background:#F97316">
                    {{ generating ? 'Generating from sources...' : 'Generate Flashcards' }}
                  </button>

                  <div v-if="generatedCards.length > 0" class="mt-4 pt-4" style="border-top:1px solid #F3F4F6">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-xs font-bold" style="color:#374151">{{ generatedCards.length }} cards generated</span>
                      <div class="flex gap-2">
                        <button @click="saveCardsAsDeck" class="text-xs px-3 py-1.5 rounded-lg font-semibold text-white" style="background:#F97316">Save as Deck</button>
                        <button @click="generatedCards = []" class="text-xs px-3 py-1.5 rounded-lg font-medium" style="background:#F3F4F6; color:#6B7280">Discard</button>
                      </div>
                    </div>
                    <div class="space-y-2 max-h-60 overflow-y-auto">
                      <div v-for="(card, i) in generatedCards" :key="i" class="bg-canvas rounded-xl p-3">
                        <div class="text-xs font-semibold mb-1" style="color:#111827">{{ i+1 }}. {{ card.front }}</div>
                        <div class="text-xs" style="color:#9CA3AF">{{ card.back }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quiz -->
              <div v-else-if="activeStudio === 'quiz'" class="bg-white rounded-2xl overflow-hidden" style="border:1px solid #E5E7EB">
                <div class="flex items-center gap-3 px-4 py-3" style="border-bottom:1px solid #F3F4F6">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:#FEF3C7">
                    <svg width="15" height="15" fill="none" stroke="#F59E0B" stroke-width="2" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-sm" style="color:#111827">Practice Test</div>
                    <div class="text-xs" style="color:#9CA3AF">Multiple choice from your sources</div>
                  </div>
                  <button @click="activeStudio = null; quizQuestions = []" class="p-2 rounded-xl" style="color:#9CA3AF; background:#F9FAFB">
                    <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <div class="p-4">
                  <!-- Language selector -->
                  <div class="flex items-center gap-2 mb-3">
                    <span class="text-xs font-semibold" style="color:#9CA3AF">Language:</span>
                    <div class="flex gap-1.5">
                      <button v-for="lang in [{v:'zh-TW',l:'繁中'},{v:'zh-CN',l:'简中'},{v:'en',l:'EN'},{v:'ja',l:'日'},{v:'ko',l:'韓'}]" :key="lang.v"
                        @click="studioLang = lang.v"
                        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        :style="studioLang === lang.v ? {background:'#F97316',color:'white'} : {background:'#F3F4F6',color:'#6B7280'}"
                      >{{ lang.l }}</button>
                    </div>
                  </div>
                  <textarea
                    v-model="promptText"
                    rows="3"
                    placeholder="e.g. N3 grammar, JLPT prep, topic focus..."
                    class="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none border bg-canvas focus:border-orange-400 transition-colors"
                    style="color:#111827; border-color:#E5E7EB"
                  />
                  <button @click="runQuiz" :disabled="generating" class="mt-3 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50" style="background:#F59E0B">
                    {{ generating ? 'Generating from sources...' : 'Generate Questions' }}
                  </button>

                  <div v-if="quizQuestions.length > 0" class="mt-4 pt-4" style="border-top:1px solid #F3F4F6">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-xs font-bold" style="color:#374151">{{ quizQuestions.length }} questions</span>
                      <div class="flex gap-2">
                        <button @click="saveQuizAsDeck" class="text-xs px-3 py-1.5 rounded-lg font-semibold text-white" style="background:#16A34A">Save as Deck</button>
                        <button @click="practicing = true" class="text-xs px-3 py-1.5 rounded-lg font-semibold text-white" style="background:#F59E0B">Practice</button>
                      </div>
                    </div>
                    <!-- Practice mode -->
                    <div v-if="practicing">
                      <div v-for="(q, qi) in quizQuestions" :key="qi" class="mb-4">
                        <div class="text-xs font-semibold mb-2" style="color:#111827">{{ qi+1 }}. {{ q.question }}</div>
                        <div class="space-y-1.5">
                          <button
                            v-for="(opt, oi) in q.options"
                            :key="oi"
                            @click="answerQuiz(qi, oi)"
                            class="w-full text-left px-3 py-2 rounded-lg text-xs transition-all"
                            :style="quizAnswers[qi] !== undefined
                              ? (oi === q.answer
                                  ? { background: '#DCFCE7', color: '#16A34A', fontWeight: '600' }
                                  : (oi === quizAnswers[qi] ? { background: '#FEE2E2', color: '#EF4444' } : { background: '#F9FAFB', color: '#9CA3AF' }))
                              : { background: '#F9FAFB', color: '#374151' }"
                          >
                            {{ ['A','B','C','D'][oi] }}. {{ opt }}
                          </button>
                        </div>
                      </div>
                    </div>
                    <!-- Preview mode -->
                    <div v-else class="space-y-3 max-h-60 overflow-y-auto">
                      <div v-for="(q, i) in quizQuestions" :key="i" class="bg-canvas rounded-xl p-3">
                        <div class="text-xs font-semibold mb-2" style="color:#111827">{{ i+1 }}. {{ q.question }}</div>
                        <div class="space-y-1">
                          <div v-for="(opt, oi) in q.options" :key="oi" class="text-xs" style="color:#6B7280">
                            {{ ['A','B','C','D'][oi] }}. {{ opt }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mind Map -->
              <div v-else-if="activeStudio === 'mindmap'" class="bg-white rounded-2xl overflow-hidden" style="border:1px solid #E5E7EB">
                <div class="flex items-center gap-3 px-4 py-3" style="border-bottom:1px solid #F3F4F6">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:#EDE9F6">
                    <svg width="15" height="15" fill="none" stroke="#A891CC" stroke-width="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-sm" style="color:#111827">Mind Map</div>
                    <div class="text-xs" style="color:#9CA3AF">Concept map from sources</div>
                  </div>
                  <button @click="activeStudio = null; mindmapNodes = []" class="p-2 rounded-xl" style="color:#9CA3AF; background:#F9FAFB">
                    <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <div class="p-4">
                  <!-- Language selector -->
                  <div class="flex items-center gap-2 mb-3">
                    <span class="text-xs font-semibold" style="color:#9CA3AF">Language:</span>
                    <div class="flex gap-1.5">
                      <button v-for="lang in [{v:'zh-TW',l:'繁中'},{v:'zh-CN',l:'简中'},{v:'en',l:'EN'},{v:'ja',l:'日'},{v:'ko',l:'韓'}]" :key="lang.v"
                        @click="studioLang = lang.v"
                        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        :style="studioLang === lang.v ? {background:'#F97316',color:'white'} : {background:'#F3F4F6',color:'#6B7280'}"
                      >{{ lang.l }}</button>
                    </div>
                  </div>
                  <textarea
                    v-model="promptText"
                    rows="2"
                    placeholder="Focus topic, or leave blank..."
                    class="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none border bg-canvas focus:border-orange-400 transition-colors"
                    style="color:#111827; border-color:#E5E7EB"
                  />
                  <button @click="runMindmap" :disabled="generating" class="mt-3 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50" style="background:#8B5CF6">
                    {{ generating ? 'Generating from sources...' : 'Generate Mind Map' }}
                  </button>

                  <div v-if="mindmapNodes.length > 0" class="mt-4 pt-4" style="border-top:1px solid #F3F4F6">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-xs font-bold" style="color:#374151">Concept Map</span>
                      <button @click="saveMindmapAsDeck" class="text-xs px-3 py-1.5 rounded-lg font-semibold text-white" style="background:#16A34A">Save as Deck</button>
                    </div>
                    <div class="bg-canvas rounded-xl p-5">
                      <div class="text-center mb-4">
                        <span class="inline-block px-4 py-2 rounded-full text-sm font-bold" style="background:#EDE9F6; color:#A891CC">{{ mindmapNodes[0]?.center }}</span>
                      </div>
                      <div class="flex flex-wrap gap-2 justify-center">
                        <span v-for="(node, i) in mindmapNodes[0]?.branches || []" :key="i"
                          class="inline-block px-3 py-1.5 rounded-lg text-xs font-medium" style="background:#DBEAFE; color:#2563EB">
                          {{ node }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Summary -->
              <div v-else-if="activeStudio === 'summary'" class="bg-white rounded-2xl overflow-hidden" style="border:1px solid #E5E7EB">
                <div class="flex items-center gap-3 px-4 py-3" style="border-bottom:1px solid #F3F4F6">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:#DCFCE7">
                    <svg width="15" height="15" fill="none" stroke="#16A34A" stroke-width="2" viewBox="0 0 24 24">
                      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="10" x2="16" y2="10"/>
                      <line x1="3" y1="14" x2="19" y2="14"/><line x1="3" y1="18" x2="12" y2="18"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-sm" style="color:#111827">AI Summary</div>
                    <div class="text-xs" style="color:#9CA3AF">Key points from your sources</div>
                  </div>
                  <button @click="activeStudio = null; summaryText = ''" class="p-2 rounded-xl" style="color:#9CA3AF; background:#F9FAFB">
                    <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <div class="p-4">
                  <!-- Language selector -->
                  <div class="flex items-center gap-2 mb-3">
                    <span class="text-xs font-semibold" style="color:#9CA3AF">Language:</span>
                    <div class="flex gap-1.5">
                      <button v-for="lang in [{v:'zh-TW',l:'繁中'},{v:'zh-CN',l:'简中'},{v:'en',l:'EN'},{v:'ja',l:'日'},{v:'ko',l:'韓'}]" :key="lang.v"
                        @click="studioLang = lang.v"
                        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        :style="studioLang === lang.v ? {background:'#F97316',color:'white'} : {background:'#F3F4F6',color:'#6B7280'}"
                      >{{ lang.l }}</button>
                    </div>
                  </div>
                  <textarea
                    v-model="promptText"
                    rows="3"
                    placeholder="What to focus on, or leave blank for full summary..."
                    class="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none border bg-canvas focus:border-orange-400 transition-colors"
                    style="color:#111827; border-color:#E5E7EB"
                  />
                  <button @click="runSummary" :disabled="generating" class="mt-3 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50" style="background:#16A34A">
                    {{ generating ? 'Generating from sources...' : 'Generate Summary' }}
                  </button>
                  <div v-if="summaryText" class="mt-4 pt-4" style="border-top:1px solid #F3F4F6">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-bold" style="color:#374151">Summary</span>
                      <button @click="saveSummaryAsDeck" class="text-xs px-3 py-1.5 rounded-lg font-semibold text-white" style="background:#16A34A">Save as Deck</button>
                    </div>
                    <div class="text-sm leading-relaxed" style="color:#374151">{{ summaryText }}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- ══════════════ DECKS TAB ══════════════ -->
          <div v-else-if="activeTab === 'decks'" class="flex-1 overflow-y-auto">

            <!-- Empty state -->
            <div v-if="bookDecks.length === 0" class="flex flex-col items-center justify-center py-16 text-center px-6">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style="background:#FFF7ED">
                <svg width="22" height="22" fill="none" stroke="#F97316" stroke-width="1.8" viewBox="0 0 24 24">
                  <rect x="2" y="5" width="14" height="16" rx="2"/><rect x="8" y="3" width="14" height="16" rx="2"/>
                </svg>
              </div>
              <p class="text-sm font-medium mb-1" style="color:#374151">No decks yet</p>
              <p class="text-xs mb-4" style="color:#9CA3AF">Generate flashcards in the Studio tab<br>to create your first deck</p>
              <button @click="activeTab = 'studio'" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style="background:#F97316">Go to Studio →</button>
            </div>

            <!-- Deck list -->
            <div v-else class="p-4 space-y-3">
              <div
                v-for="deck in bookDecks"
                :key="deck.id"
                class="bg-white rounded-2xl overflow-hidden"
                style="border:1px solid #E5E7EB; box-shadow:0 1px 3px rgba(0,0,0,0.06)"
              >
                <!-- Deck header (clickable to open detail) -->
                <div @click="openDeck(deck)" class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-canvas transition-colors" style="border-bottom:1px solid #F3F4F6">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background:#E8F6F6">
                    <svg width="16" height="16" fill="none" stroke="#66CCCC" stroke-width="2" viewBox="0 0 24 24">
                      <rect x="2" y="5" width="14" height="16" rx="2"/><rect x="8" y="3" width="14" height="16" rx="2"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-sm truncate" style="color:#111827">{{ deck.name }}</div>
                    <div class="text-xs" style="color:#9CA3AF">{{ deckCardCounts[deck.id] || 0 }} cards</div>
                  </div>
                  <button @click="deleteDeck(deck.id!)" class="p-2 rounded-xl transition-all hover:bg-red-50 shrink-0" style="color:#FCA5A5">
                    <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                    </svg>
                  </button>
                </div>

                <!-- Cards preview (click to open detail) -->
                <div @click="openDeck(deck)" v-if="deckCards[deck.id]?.length > 0" class="p-3 cursor-pointer hover:bg-canvas transition-colors">
                  <div class="space-y-2">
                    <div
                      v-for="card in deckCards[deck.id].slice(0, 3)"
                      :key="card.id"
                      class="bg-canvas rounded-xl p-2.5"
                    >
                      <div class="text-xs font-medium mb-0.5" style="color:#111827">{{ card.front }}</div>
                      <div class="text-xs" style="color:#9CA3AF">{{ card.back }}</div>
                    </div>
                    <div v-if="(deckCards[deck.id]?.length || 0) > 3" class="text-center">
                      <span class="text-xs" style="color:#9CA3AF">+{{ deckCards[deck.id].length - 3 }} more cards</span>
                    </div>
                  </div>
                </div>
                <div v-else class="p-4 text-center">
                  <span class="text-xs" style="color:#9CA3AF">No cards yet</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Empty state (desktop, no book selected) -->
      <div v-if="isDesktop && !selectedBook" class="flex-1 flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style="background:#FFF7ED">
          <svg width="28" height="28" fill="none" stroke="#F97316" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
          </svg>
        </div>
        <h3 class="text-base font-bold mb-2" style="color:#111827">Select a book</h3>
        <p class="text-sm" style="color:#9CA3AF">Choose a book from the left panel<br>or create a new one</p>
      </div>

    </div>

    <!-- Deck detail modal -->
    <div v-if="expandedDeck" class="fixed inset-0 z-50 flex items-center justify-center" style="background:rgba(0,0,0,0.5)">
      <div class="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden" style="max-height:85vh; display:flex; flex-direction:column; box-shadow:0 8px 32px rgba(0,0,0,0.2)">
        <!-- Header -->
        <div class="flex items-center gap-3 px-5 py-4 shrink-0" style="border-bottom:1px solid #F3F4F6">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:#E8F6F6">
            <svg width="18" height="18" fill="none" stroke="#66CCCC" stroke-width="2" viewBox="0 0 24 24">
              <rect x="2" y="5" width="14" height="16" rx="2"/><rect x="8" y="3" width="14" height="16" rx="2"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-sm truncate" style="color:#111827">{{ expandedDeck.name }}</div>
            <div class="text-xs" style="color:#9CA3AF">{{ (deckCards[expandedDeck?.id] || []).length }} cards · tap to flip</div>
          </div>
          <button @click="closeDeck" class="p-2 rounded-xl shrink-0" style="color:#9CA3AF; background:#F9FAFB">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <!-- Cards -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div
            v-for="card in (deckCards[expandedDeck?.id] || [])"
            :key="card.id"
            @click="flipCard(card.id)"
            class="rounded-2xl p-4 cursor-pointer transition-all text-center"
            style="min-height:80px; display:flex; align-items:center; justify-content:center"
            :style="flippedCards[card.id]
              ? { background: '#FFF7ED', border: '2px solid #F97316' }
              : { background: '#F9FAFB', border: '2px solid #E5E7EB' }"
          >
            <div class="text-sm font-medium leading-relaxed" style="color:#111827">
              {{ flippedCards[card.id] ? (card.back || '—') : (card.front || '—') }}
            </div>
          </div>
          <div v-if="!(deckCards[expandedDeck?.id] || []).length" class="text-center py-8 text-sm" style="color:#9CA3AF">
            No cards in this deck
          </div>
        </div>
        <!-- Footer hint -->
        <div class="px-5 py-3 text-center text-xs shrink-0" style="color:#9CA3AF; border-top:1px solid #F3F4F6">
          Tap a card to flip · {{ langLabel() }}
        </div>
      </div>
    </div>

    <!-- New Book modal -->
    <div v-if="showNewBookModal" class="fixed inset-0 z-50 flex items-center justify-center" style="background:rgba(0,0,0,0.4)">
      <div class="bg-white rounded-2xl w-80 p-5" style="box-shadow:0 4px 24px rgba(0,0,0,0.15)">
        <div class="text-base font-bold mb-4" style="color:#111827">New Notebook</div>
        <input
          id="newBookInput"
          v-model="newBookName"
          @keyup.enter="confirmCreateBook"
          @keyup.esc="showNewBookModal = false"
          type="text"
          placeholder="Notebook name..."
          class="w-full px-4 py-3 rounded-xl text-sm outline-none border bg-canvas focus:border-orange-400 transition-colors mb-4"
          style="color:#111827; border-color:#E5E7EB"
        />
        <div class="flex gap-2">
          <button @click="showNewBookModal = false" class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all" style="background:#F3F4F6; color:#374151">Cancel</button>
          <button @click="confirmCreateBook" class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all" style="background:#F97316">Create</button>
        </div>
      </div>
    </div>

    <!-- Delete confirmation dialog -->
    <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center" style="background:rgba(0,0,0,0.4)">
      <div class="bg-white rounded-2xl w-72 p-5 text-center" style="box-shadow:0 4px 24px rgba(0,0,0,0.15)">
        <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style="background:#FEF2F2">
          <svg width="22" height="22" fill="none" stroke="#EF4444" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
          </svg>
        </div>
        <h3 class="font-bold text-base mb-1" style="color:#111827">Delete notebook?</h3>
        <p class="text-sm mb-5" style="color:#6B7280">"<strong>{{ deleteTarget.name }}</strong>" will be permanently deleted. This cannot be undone.</p>
        <div class="flex gap-2">
          <button @click="deleteTarget = null" class="flex-1 py-2.5 rounded-xl text-sm font-semibold" style="background:#F3F4F6; color:#374151">Cancel</button>
          <button @click="confirmDelete" class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style="background:#EF4444">Delete</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getSettings } from '../stores/settings'
import {
  listBooks, createBook, deleteBook as dbDeleteBook, createDeck, deleteDeck as dbDeleteDeck,
  getSourcesForBook, addSource, deleteSource as dbDeleteSource,
  createCard, listCards, listDecks, updateBook, getDeck,
  type Book, type Source, type Deck, type Card,
} from '../lib/db'

const books = ref([])
const selectedBook = ref(null)
const sources = ref([])
const bookDecks = ref([])
const deckCards = ref({})
const deckCardCounts = ref({})
const activeTab = ref('source')
const activeStudio = ref(null)
const promptText = ref('')
const generating = ref(false)
const generatedCards = ref([])
const quizQuestions = ref([])
const quizAnswers = ref({})
const practicing = ref(false)
const mindmapNodes = ref([])
const summaryText = ref('')
const isDragging = ref(false)
const studioLang = ref('zh-TW') // 'zh-TW' | 'zh-CN' | 'en' | 'ja' | 'ko'
const fileInput = ref(null)
const linkInput = ref('')
const uploadProgress = ref(null)
const isDesktop = ref(window.innerWidth >= 768)
const showMobileBook = ref(false)
const expandedDeck = ref(null)
const flippedCards = ref({}) // cardId -> boolean
const showNewBookModal = ref(false)
const newBookName = ref('')
const deleteTarget = ref(null)

const tabs = [
  { id: 'source', label: 'Source' },
  { id: 'studio', label: 'Studio' },
  { id: 'decks', label: 'Decks' },
]

const studios = [
  { id: 'flashcards', label: 'Flashcards', desc: 'Q&A cards', bg: '#E8F6F6' },
  { id: 'quiz', label: 'Practice Test', desc: 'Multiple choice', bg: '#FEF3C7' },
  { id: 'mindmap', label: 'Mind Map', desc: 'Concept map', bg: '#EDE9F6' },
  { id: 'summary', label: 'AI Summary', desc: 'Key points', bg: '#DCFCE7' },
]

const pdfSourceCount = computed(() => sources.value.filter(s => s.type === 'pdf').length)
const webSourceCount = computed(() => sources.value.filter(s => s.type !== 'pdf').length)

function onResize() {
  isDesktop.value = window.innerWidth >= 768
  if (isDesktop.value) showMobileBook.value = true
}

onMounted(async () => {
  window.addEventListener('resize', onResize)
  books.value = await listBooks()
  // DO NOT auto-select — show library first
})

onUnmounted(() => window.removeEventListener('resize', onResize))

function openNewBookModal() {
  newBookName.value = ''
  showNewBookModal.value = true
  // Auto-focus the input on next tick
  setTimeout(() => {
    const el = document.getElementById('newBookInput')
    if (el) el.focus()
  }, 50)
}

async function confirmCreateBook() {
  const name = newBookName.value.trim() || `Notebook ${books.value.length + 1}`
  showNewBookModal.value = false
  const colors = ['#F97316','#3B82F6','#10B981','#8B5CF6','#EC4899','#F59E0B','#06B6D4']
  const book = await createBook(name, '', colors[books.value.length % colors.length])
  books.value = [book, ...books.value]
  await selectBook(book)
  showMobileBook.value = true
}

async function createNewBook() {
  const count = books.value.length + 1
  const colors = ['#F97316','#3B82F6','#10B981','#8B5CF6','#EC4899','#F59E0B','#06B6D4']
  const book = await createBook(`Notebook ${count}`, '', colors[(count-1) % colors.length])
  books.value = [book, ...books.value]
  await selectBook(book)
  showMobileBook.value = true
}

async function selectBook(book) {
  if (!book?.id) { console.error('[selectBook] ERROR: book.id is undefined!'); return; }
  try {
    console.log('[selectBook] clicked, book.id:', book.id, 'name:', book.name)
    selectedBook.value = book
    console.log('[selectBook] selectedBook.value set')
    sources.value = await getSourcesForBook(book.id)
    console.log('[selectBook] sources loaded:', sources.value.length)
  } catch(e) {
    console.error('[selectBook] ERROR:', e)
  }
  // Load decks for this book
  const deckIds = book.deckIds || []
  const decks = []
  const cardsMap = {}
  const countsMap = {}
  for (const did of deckIds) {
    const d = await getDeck(did)
    if (d) {
      decks.push(d)
      const cards = await listCards(did)
      cardsMap[did] = cards
      countsMap[did] = cards.length
    }
  }
  bookDecks.value = decks
  deckCards.value = cardsMap
  deckCardCounts.value = countsMap
  activeTab.value = 'source'
  activeStudio.value = null
  promptText.value = ''
  generatedCards.value = []
  quizQuestions.value = []
  quizAnswers.value = {}
  practicing.value = false
  mindmapNodes.value = []
  summaryText.value = ''
  if (!isDesktop.value) showMobileBook.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  const id = deleteTarget.value.id
  deleteTarget.value = null
  await dbDeleteBook(id)
  books.value = books.value.filter(b => b.id !== id)
  if (selectedBook.value?.id === id) {
    selectedBook.value = null
    sources.value = []
    bookDecks.value = []
    showMobileBook.value = false
  }
}

async function removeBook(id) {
  await dbDeleteBook(id)
  books.value = books.value.filter(b => b.id !== id)
  if (selectedBook.value?.id === id) {
    selectedBook.value = null
    sources.value = []
    bookDecks.value = []
    showMobileBook.value = false
  }
}

function triggerFileUpload() { fileInput.value?.click() }

// ── PDF upload with progress ──────────────────────────
async function handleFileUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  await savePdfFile(file)
  e.target.value = ''
}

async function handleFileDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file?.name.endsWith('.pdf')) return
  await savePdfFile(file)
}

async function savePdfFile(file) {
  if (!selectedBook.value?.id) return
  uploadProgress.value = 0
  const url = URL.createObjectURL(file)
  // Simulate progress for blob URL, then extract text
  const progressInterval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += Math.random() * 20
      if (uploadProgress.value > 90) uploadProgress.value = 90
    }
  }, 200)

  let textContent = ''
  try {
    textContent = await extractPdfText(file)
  } catch {
    textContent = `[PDF content from ${file.name}]`
  }

  clearInterval(progressInterval)
  uploadProgress.value = 100

  const src = await addSource(selectedBook.value.id, 'pdf', url, file.name, textContent)
  sources.value = [src, ...sources.value]
  setTimeout(() => { uploadProgress.value = null }, 500)
}

async function extractPdfText(file) {
  // Dynamic import pdf.js only when needed
  const pdfjsLib = window.pdfjsLib
  if (!pdfjsLib) {
    // Load pdf.js from CDN if not loaded
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
    window.pdfjsLib = pdfjsLib
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(item => item.str).join(' ') + '\n'
  }
  return text.substring(0, 5000) // cap at 5000 chars
}

async function addLink() {
  if (!linkInput.value.trim() || !selectedBook.value?.id) return
  let url = linkInput.value.trim()
  if (!url.startsWith('http')) url = 'https://' + url
  const type = /youtube\.com|youtu\.be/.test(url) ? 'youtube' : 'web'
  const title = url.length > 50 ? url.substring(0, 47) + '...' : url
  const src = await addSource(selectedBook.value.id, type, url, title, `[Web content from ${url}]`)
  sources.value = [src, ...sources.value]
  linkInput.value = ''
}

async function removeSource(id) {
  await dbDeleteSource(id)
  sources.value = sources.value.filter(s => s.id !== id)
}

// ── AI generation (uses actual source content) ────────
function getSourceContext() {
  const texts = sources.value
    .filter(s => s.content)
    .map(s => `[${s.type.toUpperCase()}: ${s.title}]\n${s.content.substring(0, 2000)}`)
    .join('\n\n')
  return texts || 'No source content available'
}

function openStudio(type) {
  activeStudio.value = type
  promptText.value = ''
  generatedCards.value = []
  quizQuestions.value = []
  quizAnswers.value = {}
  practicing.value = false
  mindmapNodes.value = []
  summaryText.value = ''
}

// ── AI API call ────────────────────────────────────────
async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const s = getSettings()
  const apiKey = s.openrouterApiKey
  if (!apiKey) throw new Error('No API key configured. Go to Settings → AI API to add your key.')

  const model = s.aiModel || 'openrouter/anthropic/claude-3-haiku'
  const provider = s.aiProvider || 'openrouter'

  if (provider === 'huggingface') {
    // HuggingFace Inference API
    const url = `https://api-inference.huggingface.co/models/${model.replace('huggingface/', '')}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `${systemPrompt}\n\n${userPrompt}`,
        parameters: { max_new_tokens: 512, temperature: 0.7 },
      }),
    })
    if (!response.ok) {
      const err = await response.text()
      throw new Error(`HF API error ${response.status}: ${err}`)
    }
    const data = await response.json()
    if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text
    if (typeof data === 'string') return data
    return JSON.stringify(data)
  } else {
    // OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://openlearn.app',
        'X-Title': 'OpenLearn',
      },
      body: JSON.stringify({
        model: model.replace('openrouter/', ''),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })
    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenRouter error ${response.status}: ${err}`)
    }
    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }
}

// ── Prompt builders ─────────────────────────────────────
function langLabel() {
  return {
    'zh-TW': 'Traditional Chinese (繁體中文)',
    'zh-CN': 'Simplified Chinese (簡體中文)',
    en: 'English',
    ja: 'Japanese (日本語)',
    ko: 'Korean (한국어)',
  }[studioLang.value] || 'Traditional Chinese (繁體中文)'
}

function buildFlashcardsPrompt(ctx: string, hint: string) {
  return `You are an expert educator. Based on the following source material, generate 6 flashcards (Q&A pairs) in ${langLabel()} that test understanding of key concepts.

IMPORTANT: All flashcard content — questions AND answers — must be written entirely in ${langLabel()}.

SOURCE MATERIAL:
${ctx}

${hint ? `USER REQUEST: ${hint}` : ''}

Generate exactly 6 flashcards. Format each as:
[FRONT] Question here (in ${langLabel()})
[BACK] Answer here (in ${langLabel()})

Make questions specific and answers concise. Focus on important concepts, definitions, and relationships from the source material.`
}

function buildQuizPrompt(ctx: string, hint: string) {
  return `You are an expert educator. Based on the following source material, generate 5 multiple-choice questions in ${langLabel()} that test understanding.

IMPORTANT: All question text and answer options must be written entirely in ${langLabel()}.

SOURCE MATERIAL:
${ctx}

${hint ? `FOCUS: ${hint}` : 'Cover the main topics.'}

Generate exactly 5 questions. Format each as:
[Q] Question here (in ${langLabel()})
[A] Correct answer (in ${langLabel()})
[B] Wrong answer (in ${langLabel()})
[C] Wrong answer (in ${langLabel()})
[D] Wrong answer (in ${langLabel()})

Make sure the correct answer is actually correct based on the source material.`
}

function buildMindmapPrompt(ctx: string, focus: string) {
  return `You are a knowledge mapping expert. Based on the following source material, create a mind map in ${langLabel()}.

IMPORTANT: All text — center topic and all branches — must be written entirely in ${langLabel()}.

SOURCE MATERIAL:
${ctx}

${focus ? `FOCUS TOPIC: ${focus}` : 'Identify the main topic and key sub-concepts.'}

Generate a mind map with one central concept and 6-8 branches. Format as:
[CENTER] Main topic (in ${langLabel()})
[BRANCH] Concept 1 (in ${langLabel()})
[BRANCH] Concept 2 (in ${langLabel()})
...etc`
}

function buildSummaryPrompt(ctx: string, focus: string) {
  return `You are a study assistant. Based on the following source material, write a concise summary in ${langLabel()} with key points.

IMPORTANT: The entire summary must be written entirely in ${langLabel()}.

SOURCE MATERIAL:
${ctx}

${focus ? `FOCUS: ${focus}` : 'Cover all important points.'}

Write a clear, structured summary with bullet points or numbered list of key takeaways.`
}

// ── AI generation functions ─────────────────────────────
async function runFlashcards() {
  generating.value = true
  try {
    const ctx = getSourceContext()
    const hint = promptText.value.trim()
    const systemMsg = 'You are an expert educator. Always respond in the exact format requested.'
    const response = await callAI(systemMsg, buildFlashcardsPrompt(ctx, hint))

    // Parse [FRONT]/[BACK] format
    const cards: { front: string; back: string }[] = []
    const frontBackRegex = /\[FRONT\]\s*([\s\S]*?)\s*\[BACK\]\s*([\s\S]*?)(?=\[FRONT\]|$)/gi
    let match
    while ((match = frontBackRegex.exec(response)) !== null) {
      const front = match[1].trim().substring(0, 200)
      const back = match[2].trim().substring(0, 300)
      if (front && back) cards.push({ front, back })
    }

    // Fallback: if parsing failed, show raw response
    if (cards.length === 0) {
      generatedCards.value = [
        { front: 'Generated content (check raw response)', back: response.substring(0, 300) }
      ]
    } else {
      generatedCards.value = cards
    }
  } catch(e: any) {
    generatedCards.value = [{ front: 'Error', back: e.message || 'Generation failed' }]
  }
  generating.value = false
}

async function runQuiz() {
  generating.value = true
  try {
    const ctx = getSourceContext()
    const hint = promptText.value.trim()
    const response = await callAI(
      'You are an expert educator. Always respond in the exact format requested.',
      buildQuizPrompt(ctx, hint)
    )

    // Parse [Q]/[A]/[B]/[C]/[D] format
    const questions: any[] = []
    const qRegex = /\[Q\]\s*([\s\S]*?)\s*\[A\]\s*([\s\S]*?)\s*\[B\]\s*([\s\S]*?)\s*\[C\]\s*([\s\S]*?)\s*\[D\]\s*([\s\S]*?)(?=\[Q\]|$)/gi
    let match
    while ((match = qRegex.exec(response)) !== null) {
      questions.push({
        question: match[1].trim(),
        options: [match[2].trim(), match[3].trim(), match[4].trim(), match[5].trim()],
        answer: 0,
      })
    }

    if (questions.length === 0) {
      quizQuestions.value = [{ question: 'Raw response', options: [response.substring(0,100), '', '', ''], answer: 0 }]
    } else {
      quizQuestions.value = questions
    }
  } catch(e: any) {
    quizQuestions.value = [{ question: 'Error: ' + (e.message || 'Generation failed'), options: ['', '', '', ''], answer: 0 }]
  }
  generating.value = false
}

async function runMindmap() {
  generating.value = true
  try {
    const ctx = getSourceContext()
    const focus = promptText.value.trim()
    const response = await callAI(
      'You are a knowledge mapping expert. Always respond in the exact format requested.',
      buildMindmapPrompt(ctx, focus)
    )

    const centerMatch = /\[CENTER\]\s*([\s\S]*?)(?=\[BRANCH\]|$)/i.exec(response)
    const branches: string[] = []
    const branchRegex = /\[BRANCH\]\s*([\s\S]*?)(?=\[BRANCH\]|\[CENTER\]|$)/gi
    let m
    while ((m = branchRegex.exec(response)) !== null) {
      const b = m[1].trim()
      if (b && b !== (centerMatch?.[1]?.trim())) branches.push(b)
    }

    if (branches.length > 0) {
      mindmapNodes.value = [{ center: centerMatch?.[1]?.trim() || 'Mind Map', branches }]
    } else {
      mindmapNodes.value = [{ center: 'Mind Map', branches: [response.substring(0, 200)] }]
    }
  } catch(e: any) {
    mindmapNodes.value = [{ center: 'Error: ' + (e.message || 'Generation failed'), branches: [] }]
  }
  generating.value = false
}

async function runSummary() {
  generating.value = true
  try {
    const ctx = getSourceContext()
    const focus = promptText.value.trim()
    const response = await callAI(
      'You are a study assistant. Write a clear, structured summary.',
      buildSummaryPrompt(ctx, focus)
    )
    summaryText.value = response
  } catch(e: any) {
    summaryText.value = 'Error: ' + (e.message || 'Generation failed')
  }
  generating.value = false
}

async function saveCardsAsDeck() {
  if (!selectedBook.value?.id || generatedCards.value.length === 0) return
  const deckName = (promptText.value.trim() || selectedBook.value.name + ' Flashcards')
  const deck = await createDeck(deckName, '')
  console.log('[saveCardsAsDeck] deck created:', deck, 'deck.id:', deck.id)
  for (const card of generatedCards.value) {
    await createCard({
      deckId: deck.id, front: card.front, back: card.back,
      hint: '', tags: [], sourceId: 0,
      fsrsState: '{}', dueDate: null, intervalSecs: 0, easeFactor: 2.5,
    })
  }
  // Add deck to book
  const updatedDeckIds = [...(selectedBook.value.deckIds || []), deck.id]
  await updateBook(selectedBook.value.id, { deckIds: updatedDeckIds })
  selectedBook.value.deckIds = updatedDeckIds
  // Refresh decks view
  bookDecks.value = [...bookDecks.value, deck]
  deckCards.value = { ...deckCards.value, [deck.id]: generatedCards.value.map(c => ({ ...c, id: Math.random() })) }
  deckCardCounts.value = { ...deckCardCounts.value, [deck.id]: generatedCards.value.length }
  generatedCards.value = []
  activeStudio.value = null
  activeTab.value = 'decks'
}

async function deleteDeck(id) {
  await dbDeleteDeck(id)
  // Remove from book
  if (selectedBook.value) {
    selectedBook.value.deckIds = selectedBook.value.deckIds.filter(d => d !== id)
    await updateBook(selectedBook.value.id, { deckIds: selectedBook.value.deckIds })
  }
  bookDecks.value = bookDecks.value.filter(d => d.id !== id)
  const { [id]: _, ...rest } = deckCards.value
  deckCards.value = rest
  deckCardCounts.value = { ...deckCardCounts.value, [id]: undefined }
}

function flipCard(cardId) {
  flippedCards.value = { ...flippedCards.value, [cardId]: !flippedCards.value[cardId] }
}

async function openDeck(deck) {
  if (!deck || deck.id == null) return
  const dId = deck.id // Keep as Number — matches how saveCardsAsDeck stores
  expandedDeck.value = deck
  flippedCards.value = {}
  if (!deckCards.value[dId]) {
    console.log('[openDeck] loading cards for dId:', dId)
    const cards = await listCards(dId)
    console.log('[openDeck] cards loaded:', cards.length, cards)
    deckCards.value = { ...deckCards.value, [dId]: cards }
    console.log('[openDeck] deckCards.value after:', deckCards.value)
  }
}

function closeDeck() {
  expandedDeck.value = null
  flippedCards.value = {}
}

async function saveQuizAsDeck() {
  if (!selectedBook.value?.id || !quizQuestions.value.length) return
  const deckName = 'Quiz: ' + (promptText.value.trim() || selectedBook.value.name)
  const deck = await createDeck(deckName, '')
  for (const q of quizQuestions.value) {
    await createCard({
      deckId: deck.id,
      front: q.question,
      back: q.options[q.answer],
      hint: q.options.filter((_, i) => i !== q.answer).join(' | '),
      tags: [],
      sourceId: 0,
      fsrsState: '{}', dueDate: null, intervalSecs: 0, easeFactor: 2.5,
    })
  }
  const updatedDeckIds = [...(selectedBook.value.deckIds || []), deck.id]
  await updateBook(selectedBook.value.id, { deckIds: updatedDeckIds })
  selectedBook.value.deckIds = updatedDeckIds
  bookDecks.value = [...bookDecks.value, deck]
  deckCards.value = { ...deckCards.value, [deck.id]: quizQuestions.value.map(q => ({ id: Math.random(), front: q.question, back: q.options[q.answer] })) }
  deckCardCounts.value = { ...deckCardCounts.value, [deck.id]: quizQuestions.value.length }
  quizQuestions.value = []
  activeStudio.value = null
  activeTab.value = 'decks'
}

async function saveMindmapAsDeck() {
  if (!selectedBook.value?.id || !mindmapNodes.value.length) return
  const deckName = 'Mind Map: ' + (promptText.value.trim() || selectedBook.value.name)
  const deck = await createDeck(deckName, '')
  const node = mindmapNodes.value[0]
  const cards = [{ front: node.center, back: 'Center topic' }]
  node.branches.forEach(b => cards.push({ front: b, back: 'Branch concept' }))
  for (const card of cards) {
    await createCard({
      deckId: deck.id, front: card.front, back: card.back,
      hint: '', tags: [], sourceId: 0,
      fsrsState: '{}', dueDate: null, intervalSecs: 0, easeFactor: 2.5,
    })
  }
  const updatedDeckIds = [...(selectedBook.value.deckIds || []), deck.id]
  await updateBook(selectedBook.value.id, { deckIds: updatedDeckIds })
  selectedBook.value.deckIds = updatedDeckIds
  bookDecks.value = [...bookDecks.value, deck]
  deckCards.value = { ...deckCards.value, [deck.id]: cards.map(c => ({ ...c, id: Math.random() })) }
  deckCardCounts.value = { ...deckCardCounts.value, [deck.id]: cards.length }
  mindmapNodes.value = []
  activeStudio.value = null
  activeTab.value = 'decks'
}

async function saveSummaryAsDeck() {
  if (!selectedBook.value?.id || !summaryText.value) return
  const deckName = 'Summary: ' + (promptText.value.trim() || selectedBook.value.name)
  const deck = await createDeck(deckName, '')
  // Split summary into lines as individual cards
  const lines = summaryText.value.split('\n').filter(l => l.trim())
  for (const line of lines) {
    const clean = line.replace(/^[\d\-\•\•\s]+/, '').trim()
    if (!clean) continue
    await createCard({
      deckId: deck.id, front: clean, back: 'From summary',
      hint: '', tags: [], sourceId: 0,
      fsrsState: '{}', dueDate: null, intervalSecs: 0, easeFactor: 2.5,
    })
  }
  const updatedDeckIds = [...(selectedBook.value.deckIds || []), deck.id]
  await updateBook(selectedBook.value.id, { deckIds: updatedDeckIds })
  selectedBook.value.deckIds = updatedDeckIds
  bookDecks.value = [...bookDecks.value, deck]
  deckCards.value = { ...deckCards.value, [deck.id]: lines.map(l => ({ id: Math.random(), front: l.replace(/^[\d\-\•\s]+/, '').trim(), back: 'From summary' })) }
  deckCardCounts.value = { ...deckCardCounts.value, [deck.id]: lines.length }
  summaryText.value = ''
  activeStudio.value = null
  activeTab.value = 'decks'
}

function answerQuiz(qi, oi) {
  quizAnswers.value = { ...quizAnswers.value, [qi]: oi }
}
</script>

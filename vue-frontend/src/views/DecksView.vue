<template>
  <div class="max-w-2xl mx-auto w-full px-6 py-8">
    <h1 class="text-2xl font-bold text-primary mb-2">Decks</h1>
    <p class="text-sm text-muted mb-8">Manage your flashcard decks across all notebooks</p>

    <!-- Empty state -->
    <div class="flex flex-col items-center justify-center py-24 text-center">
      <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style="background:#EDE9F6">
        <svg width="28" height="28" fill="none" stroke="#A891CC" stroke-width="1.8" viewBox="0 0 24 24">
          <rect x="2" y="5" width="14" height="16" rx="2"/>
          <rect x="8" y="3" width="14" height="16" rx="2"/>
        </svg>
      </div>
      <h3 class="text-lg font-bold mb-1" style="color:#111827">No decks yet</h3>
      <p class="text-sm mb-6" style="color:#9CA3AF">Decks are created automatically when you save flashcards from Studio</p>
      <router-link to="/" class="px-6 py-3 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all">
        Go to Library
      </router-link>
    </div>
  </div>
</template>

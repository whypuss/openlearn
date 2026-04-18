<template>
  <div class="max-w-2xl mx-auto w-full px-6 py-8">
    <h1 class="text-2xl font-bold text-primary mb-2">Import</h1>
    <p class="text-sm text-muted mb-8">Import content from external sources</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Anki -->
      <div class="bg-white rounded-2xl p-5 border border-border cursor-pointer hover:border-accent transition-colors" style="box-shadow:0 1px 3px rgba(0,0,0,0.05)">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style="background:#FEE2E2">
          <svg width="18" height="18" fill="none" stroke="#EF4444" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
          </svg>
        </div>
        <div class="font-bold text-sm mb-0.5" style="color:#111827">Anki Deck (.apkg)</div>
        <div class="text-xs" style="color:#9CA3AF">Import .apkg files exported from Anki</div>
      </div>

      <!-- CSV -->
      <div class="bg-white rounded-2xl p-5 border border-border cursor-pointer hover:border-accent transition-colors" style="box-shadow:0 1px 3px rgba(0,0,0,0.05)">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style="background:#DCFCE7">
          <svg width="18" height="18" fill="none" stroke="#16A34A" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125"/>
          </svg>
        </div>
        <div class="font-bold text-sm mb-0.5" style="color:#111827">CSV / JSON</div>
        <div class="text-xs" style="color:#9CA3AF">Import cards from CSV or JSON files</div>
      </div>

      <!-- PDF -->
      <div class="bg-white rounded-2xl p-5 border border-border cursor-pointer hover:border-accent transition-colors" style="box-shadow:0 1px 3px rgba(0,0,0,0.05)">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style="background:#FFF0E6">
          <svg width="18" height="18" fill="none" stroke="#F97316" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
          </svg>
        </div>
        <div class="font-bold text-sm mb-0.5" style="color:#111827">PDF Documents</div>
        <div class="text-xs" style="color:#9CA3AF">Upload PDFs to extract content for study</div>
      </div>

      <!-- Web URL -->
      <div class="bg-white rounded-2xl p-5 border border-border cursor-pointer hover:border-accent transition-colors" style="box-shadow:0 1px 3px rgba(0,0,0,0.05)">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style="background:#DBEAFE">
          <svg width="18" height="18" fill="none" stroke="#2563EB" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
          </svg>
        </div>
        <div class="font-bold text-sm mb-0.5" style="color:#111827">Web URL</div>
        <div class="text-xs" style="color:#9CA3AF">Paste a URL to import web content</div>
      </div>
    </div>
  </div>
</template>

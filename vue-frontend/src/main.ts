// @ts-nocheck
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

import HomeView from './views/HomeView.vue'
import SettingsView from './views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/settings', component: SettingsView },
  ],
})

createApp(App).use(router).mount('#app')

import { createMemoryHistory, createRouter } from 'vue-router'

import OnboardingView from '../views/OnboardingView.vue'
import EmptyView from '../views/EmptyView.vue'
import MainView from '../views/MainView.vue'
import EditorView from '../views/EditorView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  { path: '/', component: MainView },
  { path: '/onboarding', component: OnboardingView },
  { path: '/empty', component: EmptyView },
  { path: '/editor', component: EditorView },
  { path: '/settings', component: SettingsView },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router
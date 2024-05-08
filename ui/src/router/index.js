import { createMemoryHistory, createRouter } from 'vue-router'

import InstructionView from '../views/InstructionView.vue'
import EmptyView from '../views/EmptyView.vue'
import MainView from '../views/MainView.vue'
import EditorView from '../views/EditorView.vue'

const routes = [
  { path: '/', component: MainView },
  { path: '/instruction', component: InstructionView },
  { path: '/empty', component: EmptyView },
  { path: '/editor', component: EditorView },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router
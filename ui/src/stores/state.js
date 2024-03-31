import { defineStore } from 'pinia'

export const useStateStore = defineStore('state', {
  state: () => ({ 
    instructionCompleted: true,
    atLeastOneFrameSelected: true,
    inEditor: false,
    defaultStatuses: [
      { name: 'Draft', id: 0, background: '#EAECF0', color: '#475467', icon: 'lni lni-write' },
      { name: 'In progress', id: 1, background: '#FEE4E2', color: '#B42318', icon: 'lni lni-spinner-solid' },
      { name: 'On hold', id: 2, background: '#D5D9EB', color: '#3E4784', icon: 'lni lni-pause' },
      { name: 'Content required', id: 3, background: '#F9DBAF', color: '#B93815', icon: 'lni lni-postcard' },
      { name: 'Approval required', id: 4, background: '#A5F0FC', color: '#0E7090', icon: 'lni lni-checkmark' },
      { name: 'Approved', id: 5, background: '#ACDC79', color: '#3F621A', icon: 'lni lni-thumbs-up' }
    ],
    customStatuses: []
  }),
  actions: {
    closeInstruction() {
      this.instructionCompleted = true
    },
    setSelectionState(value) {
      this.atLeastOneFrameSelected = value
    }
  },
})
import { defineStore } from 'pinia'

export const useStateStore = defineStore('state', {
  state: () => ({ 
    instruction_completed: false,
    atLeastOneFrameSelected: false,
    defaultStatuses: [
      { name: 'Draft', id: 0, background: '#EAECF0', color: '#475467', icon: 'write' },
      { name: 'In progress', id: 1, background: '#FEE4E2', color: '#B42318', icon: 'spinner-solid' },
      { name: 'On hold', id: 2, background: '#D5D9EB', color: '#3E4784', icon: 'pause' },
      { name: 'Content required', id: 3, background: '#F9DBAF', color: '#B93815', icon: 'postcard' },
      { name: 'Approval required', id: 4, background: '#A5F0FC', color: '#0E7090', icon: 'checkmark' },
      { name: 'Approved', id: 5, background: '#ACDC79', color: '#3F621A', icon: 'thumbs-up' }
    ],
    customStatuses: [],
    themes: [
      { id: 0, color: '#9F1AB1', background: '#F6D0FE' },
      { id: 1, color: '#067647', background: '#A9EFC5' },
      { id: 2, color: '#C11574', background: '#FECDD6' },
      { id: 3, color: '#004EEB', background: '#B2CCFF' },
      { id: 4, color: '#475467', background: '#F5F5F5' },
      { id: 5, color: '#0E7090', background: '#A5F0FC' },
      { id: 6, color: '#B93815', background: '#F9DBAF' },
      { id: 7, color: '#3E4784', background: '#D5D9EB' },
      { id: 8, color: '#026AA2', background: '#B9E6FE' },
      { id: 9, color: '#6927DA', background: '#C3B5FD' },
      { id: 10, color: '#A15C07', background: '#FBC846' }
    ]
  }),
  actions: {
    completeInstruction() {
      this.instruction_completed = true
    },
    setSelectionState(value) {
      this.atLeastOneFrameSelected = value
    },
    addCustomStatus({name, color, background, icon}) {
      this.customStatuses.push({
        id: this.defaultStatuses.length + this.customStatuses.length,
        name,
        color,
        background,
        icon
      })
    },
    removeCustomStatus(id) {
      this.customStatuses.splice(this.customStatuses.map(item => item.id).indexOf(id), 1)
    }
  },
})
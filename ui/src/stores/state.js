import { defineStore } from 'pinia'

export const useStateStore = defineStore('state', {
  state: () => ({ 
    showOnboarding: true,
    atLeastOneValidElementSelected: false,
    defaultStatuses: [
      { name: 'Draft', id: '0', background: '#F5F5F5', color: '#475467', icon: 'write' },
      { name: 'In progress', id: '1', background: '#FEE4E2', color: '#B42318', icon: 'ruler-pencil' },
      { name: 'Revised', id: '2', background: '#FBC846', color: '#A15C07', icon: 'reload' },
      { name: 'Content required', id: '3', background: '#F9DBAF', color: '#B93815', icon: 'layout-alt-2' },
      { name: 'Research required', id: '4', background: '#A5F0FC', color: '#0E7090', icon: 'keyword-research' },
      { name: 'Ready for review', id: '5', background: '#B2CCFF', color: '#004EEB', icon: 'eye' },
      { name: 'Approval required', id: '6', background: '#B9E6FE', color: '#026AA2', icon: 'hand' },
      { name: 'Approved', id: '7', background: '#ACDC79', color: '#3F621A', icon: 'thumbs-up' },
      { name: 'On hold', id: '8', background: '#D5D9EB', color: '#3E4784', icon: 'pause' },
      { name: 'Dev review', id: '9', background: '#F6D0FE', color: '#9F1AB1', icon: 'programmer' },
      { name: 'Ready for dev', id: '10', background: '#C3B5FD', color: '#6927DA', icon: 'code-alt' },
      { name: 'Complete', id: '11', background: '#D0F8AB', color: '#3B7C0F', icon: 'flag-alt' }
    ],
    customStatuses: [],
    statusesCount: {},
    themes: [
      { id: 0, color: '#9F1AB1', background: '#F6D0FE' },
      { id: 1, color: '#067647', background: '#A9EFC5' },
      { id: 2, color: '#C11574', background: '#FECDD6' },
      { id: 3, color: '#004EEB', background: '#B2CCFF' },
      { id: 4, color: '#475467', background: '#F5F5F5' },
      { id: 5, color: '#0E7090', background: '#A5F0FC' },
      { id: 6, color: '#B93815', background: '#F9DBAF' },
      { id: 7, color: '#3E4784', background: '#D5D9EB' },
      { id: 8, color: '', background: '', custom: true}
    ],
    validNodeTypes: [
      { name: 'boolean', types: ['BOOLEAN_OPERATION'], enabled: true },
      { name: 'component', types: ['COMPONENT', 'COMPONENT_SET', 'INSTANCE'], enabled: true },
      { name: 'frame', types: ['FRAME'], enabled: true },
      { name: 'group', types: ['GROUP'], enabled: true },
      { name: 'section', types: ['SECTION'], enabled: true },
      { name: 'shapes', types: ['ELLIPSE', 'LINE', 'POLYGON', 'RECTANGLE', 'STAR' ], enabled: true },
      { name: 'slice', types: ['SLICE'], enabled: true },
      { name: 'text', types: ['TEXT'], enabled: true },
      { name: 'vector', types: ['VECTOR'], enabled: true }
    ]
  }),
  actions: {
    closeOnboarding() {
      this.showOnboarding = false
    },
    onSelectionChange(value) {
      this.atLeastOneValidElementSelected = value
    },
    addCustomStatus({id, name, color, background, icon}) {
      this.customStatuses.push({
        id,
        name,
        color,
        background,
        icon
      })
    },
    setCustomStatuses(value) {
      this.customStatuses = value
    },
    removeCustomStatus(id) {
      this.customStatuses.splice(this.customStatuses.map(item => item.id).indexOf(id), 1)
    },
    setLastThemeToCustom(color, background) {
      let customTheme = this.themes.find(theme => theme.custom)
      customTheme.color = color
      customTheme.background = background
      if (this.themes[this.themes.length - 1].id > this.themes[this.themes.length - 2].id) {
        [this.themes[this.themes.length - 2], this.themes[this.themes.length - 1]] = [this.themes[this.themes.length - 1], this.themes[this.themes.length - 2]]
      }
    },
    setLastThemeToDefault(id) {
      if (this.themes.find(theme => theme.id === id).custom) return
      if (this.themes[this.themes.length - 1].id < this.themes[this.themes.length - 2].id) {
        [this.themes[this.themes.length - 2], this.themes[this.themes.length - 1]] = [this.themes[this.themes.length - 1], this.themes[this.themes.length - 2]]
      }
    },
    setStatusesCount(value) {
      this.statusesCount = value
    },
    setValidNodeTypesFromValues(values) {
      values.forEach((value, idx) => {
        this.validNodeTypes[idx].enabled = value;
      })
    },
    setValidNodeTypes(value) {
      this.validNodeTypes = value
    }
  },
})
<template>
  <TheMain />
  <TheFooter v-if="!stateStore.instruction_completed || stateStore.atLeastOneFrameSelected" />
</template>

<script>
  import BaseButton from './components/base_elements/BaseButton.vue'
  import TheMain from './components/TheMain.vue'
  import TheFooter from './components/TheFooter.vue'

  import { mapStores } from 'pinia'
  import { useStateStore } from './stores/state'

  export default {
    name: 'App',
    components: {
      BaseButton,
      TheMain,
      TheFooter
    },
    computed: {
      ...mapStores(useStateStore)
    },
    mounted() {
      window.addEventListener('message', (e) => {
        let messageType = e.data.pluginMessage?.type
        let messageData = e.data.pluginMessage?.data
        switch (messageType) {
          case 'setInstructionState':
            if (messageData.instruction_completed) this.stateStore.closeInstruction()
            break
          case 'setSelectionState':
            this.stateStore.setSelectionState(messageData.atLeastOneFrameSelected)
          break
        }
      })
    }
  }
</script>

<style>
  #app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
</style>

<template>
  <RouterView />
</template>

<script>
  import { mapStores } from 'pinia'
  import { useStateStore } from './stores/state'

  export default {
    name: 'App',
    computed: {
      ...mapStores(useStateStore)
    },
    mounted() {
      window.addEventListener('message', (e) => {
        let messageType = e.data.pluginMessage?.type
        let messageData = e.data.pluginMessage?.data
        switch (messageType) {
          case 'setInstructionState':
            if (messageData.instruction_completed) this.stateStore.completeInstruction()
            else this.$router.push('/instruction')
          break
          case 'setSelectionState':
            this.stateStore.setSelectionState(messageData.atLeastOneFrameSelected)
            if (this.stateStore.atLeastOneFrameSelected) {
              this.$router.push('/')
            } else {
              this.$router.push('/empty')
            }
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

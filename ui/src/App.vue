<template>
  <RouterView />
</template>

<script>
  import { mapStores } from 'pinia'
  import { useStateStore } from './stores/state'
  import { toRaw } from "vue";

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
          case 'setOnboardingState':
            // if (!messageData.showOnboarding) this.stateStore.closeOnboarding()
            // else {
            //   this.$router.push('/onboarding')
            // }
          break
          case 'updateStatusesCount':
            this.stateStore.setStatusesCount(messageData.statusesCount)
          break
          case 'onSelectionChange':
            // if (this.stateStore.showOnboarding) return;
            this.stateStore.onSelectionChange(messageData.atLeastOneValidElementSelected)
            if (this.stateStore.atLeastOneValidElementSelected) {
              this.$router.push('/')
            } else {
              this.$router.push('/empty')
            }
          break
          case 'setCustomStatuses':
            this.stateStore.setCustomStatuses(messageData)
          break
          case 'removeCustomStatus':
            this.stateStore.removeCustomStatus(messageData.id)
            parent.postMessage({ pluginMessage: { type: "saveCustomStatuses", data: toRaw(this.stateStore.customStatuses) } }, "*")
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

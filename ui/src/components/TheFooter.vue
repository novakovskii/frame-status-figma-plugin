<template>
  <div class="the-footer border-top">
    <template v-if="!stateStore.instruction_completed">
      <div></div>
      <BaseButton variant="flat" ok @click="closeInstruction">Got it</BaseButton>
    </template>
    <template v-else-if="stateStore.instruction_completed && stateStore.atLeastOneFrameSelected && !stateStore.inEditor">
      <div>
        <BaseButton ok>Remove</BaseButton>
        <BaseButton cancel>Remove all</BaseButton>
      </div>
      <BaseButton variant="iconic" icon="lni lni-reload"></BaseButton>
    </template>
    <template v-else-if="stateStore.inEditor">
      <div>
        <BaseButton ok>Save</BaseButton>
        <BaseButton cancel>Cancel</BaseButton>
      </div>
    </template>
  </div>
</template>

<script>
  import BaseButton from './base_elements/BaseButton.vue'

  import { mapStores } from 'pinia'
  import { useStateStore } from '../stores/state'

  export default {
    name: "TheFooter",
    components: {
      BaseButton
    },
    computed: {
      ...mapStores(useStateStore)
    },
    methods: {
      closeInstruction() {
        this.stateStore.closeInstruction()
        parent.postMessage({ pluginMessage: { type: "closeInstruction" } }, "*")
      }
    }
  }
</script>

<style scoped lang="scss">
  .the-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
  }
</style>
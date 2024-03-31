<template>
  <div class="the-add-status-button border-top">
    <BaseButton icon="lni lni-plus" icon-wrapper-size="32">Add custom status</BaseButton>
  </div>
</template>

<script>
  import BaseButton from './base_elements/BaseButton.vue'

  export default {
    name: "TheAddStatusButton",
    components: {
      BaseButton
    }
  }
</script>

<style scoped lang="scss">
  .the-add-status-button {
    height: 40px;
    display: flex;
    align-items: center;
  }
</style>
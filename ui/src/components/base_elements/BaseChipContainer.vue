<template>
  <div class="base-chip-container">
    <div v-if="empty">No results</div>
    <slot v-else />
  </div>
</template>

<script>
  export default {
    name: "BaseChipContainer",
    props: {
      empty: {
        type: Boolean,
        default: false
      }
    }
  }
</script>

<style scoped lang="scss">
  .base-chip-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
</style>
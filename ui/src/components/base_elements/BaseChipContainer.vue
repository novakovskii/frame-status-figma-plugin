<template>
  <div class="base-chip-container">
    <div v-if="empty" class="type base-chip-container__empty-state-caption">No status found</div>
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

    &__empty-state-caption {
      color: var(--black3);
      text-align: center;
      flex: 1;
    }
  }
</style>
<template>
  <div class="the-header">
    <slot />
    <div v-if="$slots.title" class="the-header__title type type--xlarge">
      <slot name="title" />
    </div>
  </div>
</template>

<script>
  export default {
    name: "TheHeader"
  }
</script>

<style scoped lang="scss">
  .the-header {
    display: flex;
    align-items: center;

    &__title {
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      width: 100%;
    }
  }
</style>
<template>
  <div class="the-main">
    <slot />
  </div>
</template>

<script>
  export default {
    name: "TheMain"
  }
</script>

<style scoped lang="scss">
  .the-main {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: auto;
  }
</style>
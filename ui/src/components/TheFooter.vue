<template>
  <div class="the-footer border-top">
    <slot />
  </div>
</template>

<script>
  export default {
    name: "TheFooter"
  }
</script>

<style scoped lang="scss">
  .the-footer {
    display: flex;
    align-items: center;
    padding: 8px;
  }
</style>
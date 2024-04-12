<template>
  <div class="base-icon" v-html="icon" />
</template>

<script>
  export default {
    name: "BaseIcon",
    props: {
      icon: {
        type: String,
        default: ''
      }
    }
  }
</script>

<style lang="scss">
  .base-icon{
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    // border: 1px solid var(--black1);
    // border-radius: 2px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
</style>
<template>
  <div 
    class="base-theme-option type"
    :class="{'base-theme-option--active': active}"
    :style="{
      'color': color, 
      'background': background
    }"
    tabindex="0"
    @click="$emit('selectTheme', {color, background})"
  >
    <input type="radio">
    Aa
  </div>
</template>

<script>
  export default {
    name: "BaseThemeOption",
    props: {
      color: {
        type: String,
        default: '#A15C07'
      },
      background: {
        type: String,
        default: '#FEEE95'
      },
      active: {
        type: Boolean,
        default: false
      }
    }
  }
</script>

<style scoped lang="scss">
  .base-theme-option{
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      width: calc(100% + 4px);
      height: calc(100% + 4px);
      background-color: inherit;
      color: inherit;
      opacity: 0.6;
      z-index: -1;
      border-radius: inherit;
      display: none;
    }

    &--active {
      
      &::before {
        display: block;
        background-color: currentColor;
        opacity: 1;
        width: calc(100% + 2px);
        height: calc(100% + 2px);
      }
    }

    &:hover {
      
      &::before {
        display: block;
      }
    }

    &:focus {
      outline: 2px solid var(--blue);
    }

    input[type="radio"] {
      display: none;
    }
  }
</style>
<template>
  <button 
    class="base-button ui-xs-n"
    :class="[`base-button--${variant}`, {'base-button--ok': ok, 'base-button--cancel': cancel}]"
    :style="{
      'width': variant === 'iconic' ? `${size}px` : 'unset',
      'height': variant === 'iconic' ? `${size}px` : '32px'
    }"
  >
    <i 
      v-if="icon" 
      :class="icon" 
      :style="{
        'font-size': `${iconSize}px`,
        'width': iconWrapperSize ? `${iconWrapperSize}px` : `${iconSize}px`,
        'height': iconWrapperSize ? `${iconWrapperSize}px` : `${iconSize}px`
      }"
    ></i>
    <slot/>
  </button>
</template>

<script>
  export default {
    name: "BaseButton",
    props: {
      variant: {
        type: String,
        default: 'text'
      },
      size: {
        type: [Number, String],
        default: 32
      },
      ok: {
        type: Boolean,
        default: false
      },
      cancel: {
        type: Boolean,
        default: false
      },
      icon: {
        type: String,
        default: ''
      },
      iconSize: {
        type: [Number, String],
        default: 12
      },
      iconWrapperSize: {
        type: [Number, String],
        default: null
      }
    }
  }
</script>

<style scoped lang="scss">
  .base-button {
    background: none;
    border: none;
    padding: 0;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:not(:first-of-type) {
      margin-left: 8px;
    }

    &--text {
      cursor: pointer;
      padding: 0 4px;

      &.base-button--ok {
        color: var(--color-primary);
      }
      &.base-button--cancel {
        color: var(--color-destructive);
      }
    }

    &--flat {
      padding: 0 16px;
      border-radius: 6px;
      color: var(--color-white);
      background: var(--color-dark);

      &.base-button--ok {
        background: var(--color-primary);
      }
    }

    &--outlined {
      padding: 0 16px;
      border: 1px solid var(--color-dark);
      border-radius: 6px;
    }

    &--iconic {
      padding: 0;
      border-radius: 6px;

      &:hover {
        background: rgba(0, 0, 0, 0.06);
      }
    }

    i {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
<template>
  <div class="base-status-bar-preview">
    <div class="base-status-bar-preview__status-bar" :style="{'background': background}">
      <div class="base-status-bar-preview__status-bar-icon-wrapper" v-html="iconsStore.icons[icon]" :style="{'fill': color}"></div>
      <span class="type" :style="{'color': color}">{{ name }}</span>
    </div>
  </div>
</template>

<script>
  import { mapStores } from 'pinia'
  import { useIconsStore } from '../../stores/icons'

  export default {
    name: "BaseStatusBarPreview",
    props: {
      name: {
        type: String,
        default: 'My status'
      },
      color: {
        type: String,
        default: '#A15C07'
      },
      background: {
        type: String,
        default: '#FEEE95'
      },
      icon: {
        type: String,
        default: 'bolt'
      }
    },
    computed: {
      ...mapStores(useIconsStore)
    },
  }
</script>

<style lang="scss">
  .base-status-bar-preview {
    width: 100%;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #F5F5F5;

    &__status-bar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 2px 12px 2px 6px;
      font-size: var(--font-size-xsmall);
      border-top-left-radius: 20px;
      border-top-right-radius: 0;
      border-bottom-left-radius: 20px;
      border-bottom-right-radius: 40px;
    }

    &__status-bar-icon-wrapper {
      width: 12px;
      height: 12px;

      *{
        fill: inherit;
      }
    }
  }
</style>
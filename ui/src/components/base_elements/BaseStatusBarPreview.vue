<template>
  <div class="base-status-bar-preview">
    <div class="base-status-bar-preview__status-bar" :style="{'background': background}">
      <div class="base-status-bar-preview__status-bar-icon-wrapper" v-html="iconsStore.statusIcons[icon]" :style="{'fill': color}"></div>
      <span class="base-status-bar-preview__status-bar-name type" :style="{'color': color}">{{ name }}</span>
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
        type: String
      },
      background: {
        type: String
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
      max-width: calc(100% - 16px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 4px 8px 4px 12px;
      font-size: var(--font-size-xsmall);
      border-top-right-radius: 28px;
      border-top-left-radius: 0;
      border-bottom-left-radius: 56px;
      border-bottom-right-radius: 28px;
      overflow: hidden;
    }

    &__status-bar-icon-wrapper {
      min-width: 12px;
      min-height: 12px;

      * {
        fill: inherit;
      }
    }

    &__status-bar-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>
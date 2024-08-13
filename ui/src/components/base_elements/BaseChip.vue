<template>
  <div 
    class="base-chip" 
    :class="{'base-chip--active': active, 'base-chip--closeable': closeable, 'base-chip--with-count': count > 0}"
    :style="{
      'color': color, 
      'background': background
    }"
    @click="setStatus"
  >
    <div class="base-chip__icon-wrapper" v-html="iconsStore.statusIcons[icon]" :style="{'fill': color}"></div>
    <div class="base-chip__name">{{ name }}</div>
    <div v-if="count > 0" class="base-chip__count" :class="{'base-chip__count--with-padding': count > 9}">
      {{count}}
    </div>
    <div 
      v-if="closeable" 
      ref="closeButton"
      class="base-chip__close-button icon-button" 
      v-html="iconsStore.statusIcons.close" 
      :style="{'fill': color}"
      @click.stop="remove"
    />
  </div>
</template>

<script>
  import { mapStores } from 'pinia'
  import { useIconsStore } from '../../stores/icons'
  import { useStateStore } from '../../stores/state'

  export default {
    name: "BaseChip",
    props: {
      name: {
        type: String,
        default: ''
      },
      id: {
        type: String,
        default: null
      },
      icon: {
        type: String,
        default: ''
      },
      color: {
        type: String,
        default: '#FFFFFF'
      },
      background: {
        type: String,
        default: '#333333'
      },
      count: {
        type: Number,
        default: 0
      },
      closeable: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      ...mapStores(useStateStore, useIconsStore),
      active() {
        return this.count > 0
      }
    },
    methods: {
      setStatus(e) {
        if (e.target === this.$refs.closeButton) {
          return
        }
        parent.postMessage({ pluginMessage: { type: "setStatus", data: { name: this.name, id: this.id, color: this.color, background: this.background, icon: this.iconsStore.statusIcons[this.icon] } } }, "*")
      },
      remove() {
        this.$emit('remove', this.id)
      }
    }
  }
</script>

<style lang="scss">
  .base-chip {
    height: 20px;
    font-size: var(--font-size-xsmall);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    border-radius: 10px;
    padding: 3px 6px;
    cursor: pointer;
    position: relative;
    max-width: 100%;

    &::before {
      content: '';
      position: absolute;
      width: calc(100% + 4px);
      height: calc(100% + 4px);
      background-color: inherit;
      color: inherit;
      opacity: 0.6;
      z-index: -1;
      border-radius: 12px;
      display: none;
      left: -2px;
      top: -2px;
    }

    &__name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 100%;
      line-height: 14px;
    }

    &__icon-wrapper {
      min-width: 12px;
      min-height: 12px;

      * {
        fill: inherit;
      }
    }

    &--active {

      &::before {
        display: block;
        background-color: currentColor;
        opacity: 1;
        width: calc(100% + 2px);
        height: calc(100% + 2px);
        left: -1px;
        top: -1px;
      }
    }

    &--closeable {
      padding-right: 3px;
    }

    &--with-count {
      padding-right: 3px;
    }

    &:hover {
      &::before {
        display: block;
      }
    }

    &:active:not(:has(.base-chip__close-button:active)) {
      outline: 2px solid var(--blue);
    }

    i {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    &__count {
      min-width: 14px;
      height: 14px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;

      &--with-padding {
        padding: 0 4px;
      }
    }

    &__close-button {
      width: 14px !important;
      height: 14px !important;
      border-radius: 50% !important;
      cursor: pointer !important;
      
      * {
        filter: none !important;
      }

      svg {
        width: 7px !important;
        height: 7px !important;
        pointer-events: none;
      }
    }
  }
</style>
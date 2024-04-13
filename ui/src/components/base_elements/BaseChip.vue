<template>
  <div 
    class="base-chip" 
    :class="{'base-chip--active': active, 'base-chip--closeable': closeable, 'base-chip--with-count': count > 0}"
    :style="{
      'color': color, 
      'background': background
    }"
    ref="chip"
    tabindex="0"
    @click="setStatus"
  >
    <div class="base-chip__icon-wrapper" v-html="iconsStore.icons[icon]" :style="{'fill': color}"></div>
    {{ name }}
    <div v-if="count > 0" class="base-chip__count" :class="{'base-chip__count--with-padding': count > 9}">
      {{count}}
    </div>
    <div 
      v-if="closeable" 
      class="base-chip__close-button icon-button" 
      v-html="iconsStore.icons.close" 
      :style="{'fill': color}"
      tabindex="0"
      @click="remove"
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
        type: Number,
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
        if (e.target !== this.$refs.chip) {
          return
        }
        let currentDate = new Date()
        let currentDateFormatted = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}, ${currentDate.getHours()}:${currentDate.getMinutes() < 10 ? '0': ''}${currentDate.getMinutes()}`
        parent.postMessage({ pluginMessage: { type: "setStatus", data: { name: this.name, id: this.id, color: this.color, background: this.background, currentDate: currentDateFormatted, icon: this.iconsStore.icons[this.icon] } } }, "*")
      },
      remove() {
        this.stateStore.removeCustomStatus(this.id)
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

    &__icon-wrapper {
      width: 12px;
      height: 12px;
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

    &:focus {
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
      }
    }
  }
</style>
<template>
  <div 
    class="base-chip ui-xs-n" 
    :class="{'base-chip--active': active}"
    :style="{
      'color': color, 
      'background': background,
      'outline-color': `${background}60`
    }"
    @click="setStatus"
  >
    <i 
      v-if="icon" 
      :class="icon" 
      :style="{
        'font-size': `${iconSize}px`,
        'width': `${iconSize}px`,
        'height': `${iconSize}px`
      }"
    ></i>
    {{ name }}
    <div v-if="count > 0" class="base-chip__count" :class="{'base-chip__count--with-padding': count > 9}">
      {{count}}
    </div>
    <BaseButton v-if="closeable" variant="iconic" icon="lni lni-close" size="14" icon-size="8" :style="{'color': color}"></BaseButton>
  </div>
</template>

<script>
  import BaseButton from './BaseButton.vue'

  export default {
    name: "BaseChip",
    components: {
      BaseButton
    },
    props: {
      name: {
        type: String,
        default: ''
      },
      icon: {
        type: String,
        default: ''
      },
      iconSize: {
        type: Number,
        default: 12
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
      active: {
        type: Boolean,
        default: false
      },
      closeable: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      setStatus() {
        let currentDate = new Date()
        let currentDateFormatted = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}, ${currentDate.getHours()}:${currentDate.getMinutes()}`
        parent.postMessage({ pluginMessage: { type: "setStatus", data: { name: this.name, color: this.color, background: this.background, currentDate: currentDateFormatted } } }, "*")
      }
    }
  }
</script>

<style scoped lang="scss">
  .base-chip {
    font-family: 'Inter';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 20px;
    padding: 6px 8px;
    cursor: default;

    &--active {
      outline: 1px solid currentColor;
    }

    &:hover {
      outline: 3px solid;
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
  }
</style>
<template>
  <div class="base-modal">
    <div class="base-modal__content">
      <div v-if="title" class="base-modal__title border-bottom type type--xlarge">{{ title }}</div>
      <slot />
      <TheFooter class="the-footer--modal">
        <button class='button button--tertiary-destructive' @click="$emit('close')">{{ cancelText }}</button>
        <button 
          class='button button--tertiary'
          @click="onOk"
        >{{ okText }}</button>
      </TheFooter>
    </div>
  </div>
</template>

<script>
  import TheFooter from '../TheFooter.vue'

  export default {
    name: "BaseModal",
    components: {
      TheFooter
    },
    props: {
      title: {
        type: String,
        default: ''
      },
      cancelText: {
        type: String,
        default: 'Cancel'
      },
      okText: {
        type: String,
        default: 'Save'
      },
      okAction: {
        type: Function
      }
    },
    emits: ['close'],
    methods: {
      onOk() {
        this.okAction()
        this.$emit('close')
      }
    }
  }
</script>

<style scoped lang="scss">
  .base-modal{
    position: absolute;
    background-color: rgba(0, 0, 0, 0.4);
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &__content {
      width: calc(100% - 40px);
      background-color: #fff;
      border-radius: 4px;
      max-height: calc(100% - 40px);
      display: flex;
      flex-direction: column;
    }

    &__title {
      padding: 8px;
      display: flex;
      align-items: center;
      min-height: 48px;
    }
  }

  .the-footer--modal {
    gap: 8px;
    justify-content: flex-end;
  }
</style>
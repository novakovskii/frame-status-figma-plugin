<template>
  <TheModal title="Choose theme" class="the-choose-theme-modal">
    <BaseStatusBarPreview 
      :name="name"
      :color="color"
      :background="background"
      :icon="icon"
    />
    <div class="the-choose-theme-modal__color-picker-container">
      <BaseColorPicker
        title="Background"
        v-model="backgroundValue"
      />
      <BaseColorPicker
        title="Color"
        v-model="colorValue"
      />
    </div>
    <div class="type the-choose-theme-modal__caption">It is recommended to choose unique colors to avoid confusion with other statuses.</div>
  </TheModal>
</template>

<script>
  import TheModal from './base_elements/BaseModal.vue'
  import BaseStatusBarPreview from './base_elements/BaseStatusBarPreview.vue'
  import BaseColorPicker from './base_elements/BaseColorPicker.vue'

  export default {
    name: "TheChooseThemeModal",
    components: {
      TheModal,
      BaseStatusBarPreview,
      BaseColorPicker
    },
    props: {
      name: {
        type: String
      },
      color: {
        type: String
      },
      background: {
        type: String
      },
      icon: {
        type: String
      }
    },
    data () {
      return {
        backgroundValue: 'FEEE95',
        colorValue: 'A15C07'
      }
    }
  }
</script>

<style scoped lang="scss">
  .the-choose-theme-modal{
    
    &__color-picker-container {
      padding: 10px;
      display: flex;
      gap: 20px;
    }

    &__caption {
      padding: 10px;
    }
  }
</style>
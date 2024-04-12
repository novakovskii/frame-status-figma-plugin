<template>
  <TheMain class="the-main--instruction">
    <img src="https://i.giphy.com/xT8qB0lNtZrloL1ahi.webp" class="the-main--instruction__image">
    <div class="type type--large type--bold the-main--instruction__title">Notice</div>
    <div class="type the-main--instruction__caption">Track progress through statuses on your page. Choose from standard statuses or create your own unique one. Monitor who and when changed status states.</div>
  </TheMain>
  <TheFooter class="the-footer--instruction">
    <button class='button button--tertiary'>Skip</button>
    <button class='button button--primary'>Next</button> 
  </TheFooter>
</template>

<script>
  import TheMain from '../components/TheMain.vue'
  import TheFooter from '../components/TheFooter.vue'
  import { mapStores } from 'pinia'
  import { useStateStore } from '../stores/state'

  export default {
    name: 'InstructionView',
    components: {
      TheMain,
      TheFooter
    },
    computed: {
      ...mapStores(useStateStore)
    }
  }
</script>

<style lang="scss">
  .the-main--instruction {
    align-items: center;
    padding: 8px;

    &__image {
      width: 100%;
      border-radius: 4px;
    }

    &__title {
      text-align: center;
      margin-top: 16px;
    }

    &__caption {
      text-align: center;
      max-width: 200px;
      margin-top: 8px;
    }
  }

  .the-footer--instruction {
    justify-content: space-between;
  }
</style>
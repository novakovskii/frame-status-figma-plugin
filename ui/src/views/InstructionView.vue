<template>
  <TheMain class="the-main--instruction">
    <img :src="pages[currentPage].image" class="the-main--instruction__image">
    <div class="type type--large type--bold the-main--instruction__title">{{ pages[currentPage].title }}</div>
    <div class="type the-main--instruction__caption">{{ pages[currentPage].caption }}</div>
  </TheMain>
  <ThePagination 
    :current-page="currentPage"
    :page-count="pages.length"
  />
  <TheFooter class="the-footer--instruction">
    <button 
      v-if="currentPage > 0"
      class='button button--tertiary'
      @click="currentPage--"
    >Back</button>
    <div class="the-footer--instruction__button-container">
      <button 
        v-if="currentPage < pages.length - 1"
        class='button button--secondary'
        @click="completeInstruction"
      >Skip</button>
      <button 
        v-if="currentPage < pages.length - 1"
        class='button button--primary'
        @click="currentPage++"
      >Next</button> 
      <button 
        v-else
        class='button button--primary'
        @click="completeInstruction"
      >Get started</button> 
    </div>
  </TheFooter>
</template>

<script>
  import TheMain from '../components/TheMain.vue'
  import ThePagination from '../components/ThePagination.vue'
  import TheFooter from '../components/TheFooter.vue'
  import { mapStores } from 'pinia'
  import { useStateStore } from '../stores/state'

  export default {
    name: 'InstructionView',
    components: {
      TheMain,
      ThePagination,
      TheFooter
    },
    data () {
      return {
        currentPage: 0,
        pages: [
          {title: 'Title 11111', caption: 'Caption 11111', image: 'https://i.giphy.com/xT8qB0lNtZrloL1ahi.webp'},
          {title: 'Title 22222', caption: 'Caption 22222', image: 'https://i.giphy.com/xT8qB0lNtZrloL1ahi.webp'},
          {title: 'Title 33333', caption: 'Caption 33333', image: 'https://i.giphy.com/xT8qB0lNtZrloL1ahi.webp'},
        ]
      }
    },
    computed: {
      ...mapStores(useStateStore)
    },
    methods: {
      completeInstruction() {
        this.stateStore.completeInstruction()
        parent.postMessage({ pluginMessage: { type: "completeInstruction" } }, "*")
        if (this.stateStore.atLeastOneRootFrameSelected) {
          this.$router.push('/')
        } else {
          this.$router.push('/empty')
        }
      }
    }
  }
</script>

<style lang="scss">
  .the-main--instruction {
    align-items: center;
    padding: 8px;

    &__image {
      width: 100%;
      border-radius: 8px;
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

    &__button-container {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      justify-content: flex-end;
    }
  }
</style>
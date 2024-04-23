<template>
  <div class="the-pagination">
    <div 
      class="the-pagination__dot"
      :class="{'the-pagination__dot--active': idx === currentPage}"
      v-for="(page, idx) in pageCount"
    ></div>
  </div>
</template>

<script>
  export default {
    name: "ThePagination",
    props: {
      currentPage: {
        type: Number,
        default: 0
      },
      pageCount: {
        type: Number,
        default: 3
      }
    }
  }
</script>

<style scoped lang="scss">
  .the-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 40px;
    
    &__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #F5F5F5;
      
      &--active {
        background-color: var(--color-primary);
      }
    }
  }
</style>
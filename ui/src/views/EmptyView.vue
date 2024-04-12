<template>
  <TheMain class="the-main--empty">
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="hint__image">
      <g clip-path="url(#clip0_65_622)">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 4H16V12H32V4H36V12H44V16H36V32H44V36H36V44H32V36H16V44H12V36H4V32H12V16H4V12H12V4ZM16 32V16H32V32H16Z" fill="#D5D9EB"/>
        <path d="M30.9093 32.3603L34.0007 40.8537L31.1816 41.8798L28.0902 33.3864L23.918 36.5422L25.4087 21.6332L36.134 32.0959L30.9093 32.3603Z" fill="#4D98DE"/>
      </g>
      <defs>
        <clipPath id="clip0_65_622">
          <rect width="48" height="48" fill="white"/>
        </clipPath>
      </defs>
    </svg>
    <div class="type the-main--empty__caption">Select at least one frame.</div>
  </TheMain>
  <TheFooter class="the-footer--empty">
    <button class='button button--tertiary-destructive'>Remove all</button>
    <div class="icon-button">
      <div class="icon icon--swap"></div>
    </div>
  </TheFooter>
</template>

<script>
  import TheMain from '../components/TheMain.vue'
  import TheFooter from '../components/TheFooter.vue'

  export default {
    name: 'EmptyView',
    components: {
      TheMain,
      TheFooter
    }
  }
</script>

<style lang="scss">
  .the-main--empty {
    align-items: center;
    justify-content: center;

    &__caption {
      text-align: center;
      max-width: 200px;
      margin-top: 8px;
    }
  }

  .the-footer--empty {
    justify-content: space-between;
  }
</style>
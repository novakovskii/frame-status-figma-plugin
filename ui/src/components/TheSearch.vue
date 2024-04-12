<template>
  <div class="the-search border-bottom">
    <div class="the-search__icon icon icon--search"></div>
    <input
      class="type"
      type="text" 
      placeholder="Search by status" 
      autocomplete="off"
      @input="$emit('update:modelValue', $event.target.value)"
    >
  </div>
</template>

<script>
  export default {
    name: "TheSearch",
    props: {
      modelValue: {
        type: String,
        default: ''
      }
    },
    emits: ['update:modelValue']
  }
</script>

<style scoped lang="scss">
  .the-search {
    display: flex;
    box-sizing: border-box;
    align-items: center;
    min-height: 40px;
    position: relative;

    &__icon {
      position: absolute;
      left: 0;
    }

    input {
      height: 40px;
      width: 100%;
      padding: 0;
      margin: 0;
      border: none;
      border-radius: 2px;
      padding-left: 32px;

      &:focus {
        outline: 2px solid var(--blue);
        outline-offset: -2px;
      }

      &::placeholder {
        font-size: 11px;
        color: var(--color-disabled);
        opacity: 1;
      }
    }
  }
</style>
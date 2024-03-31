<template>
  <div class="the-search border-bottom">
    <label for="search">
      <i class="lni lni-search-alt"></i>
    </label>
    <input 
      type="text" 
      class="ui-xs-n" 
      id="search" 
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
    padding: 4px;
    box-sizing: border-box;
    align-items: center;
    height: 40px;

    i {
      display: flex;
      width: 32px;
      height: 32px;
      align-items: center;
      justify-content: center;
    }

    input {
      height: 32px;
      width: 100%;
      padding: 0;
      margin: 0;
      border: none;

      &:focus {
        outline: none;
      }

      &::placeholder {
        font-size: 11px;
        color: var(--color-disabled);
        opacity: 1;
      }
    }
  }
</style>
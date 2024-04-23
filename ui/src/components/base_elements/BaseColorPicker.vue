<template>
  <div class="base-color-picker">
    <div v-if="title" class="base-color-picker__title type">{{ title }}</div>
    <div class="base-color-picker__wrapper">
      <label class="base-color-picker__color-preview" :style="{'background': innerValue}">
        <input 
          type="color"
          :value="innerValue"
          @input="$emit('update:modelValue', $event.target.value.toUpperCase())"  
        >
      </label>
      <span class="base-color-picker__dash type">#</span>
      <input 
        type="text" 
        class="type"
        :value="rawInnerValue"
        @change="onTextInputChange"
      >
    </div>
  </div>
</template>

<script>
  export default {
    name: "BaseColorPicker",
    props: {
      title: {
        type: String,
        default: ''
      },
      modelValue: {
        type: String,
        default: ''
      }
    },
    emits: ['update:modelValue'],
    computed: {
      innerValue: {
        get() {
          return this.modelValue
        }
      },
      rawInnerValue: {
        get() {
          return this.innerValue.substring(1)
        }
      }
    },
    methods: {
      onTextInputChange(e) {
        let inputString = e.target.value
        let outputString = ''
        let matchResult = null

        matchResult = inputString.match(/[0-9A-F]{6}/gmi)?.[0]
        if (matchResult) {
          outputString = matchResult
        } else {
          matchResult = inputString.match(/[0-9A-F]{3}/gmi)?.[0]
          if (matchResult) {
            outputString = `${matchResult[0]}${matchResult[0]}${matchResult[1]}${matchResult[1]}${matchResult[2]}${matchResult[2]}`
          } else {
            matchResult = inputString.match(/[0-9A-F]{2}/gmi)?.[0]
            if (matchResult) {
              outputString = `${matchResult}${matchResult}${matchResult}`
            } else {
              matchResult = inputString.match(/[0-9A-F]{1}/gmi)?.[0]
              if (matchResult) {
                outputString = `${matchResult}${matchResult}${matchResult}${matchResult}${matchResult}${matchResult}`
              } else {
                // outputString = this.modelValue.substring(1)
              }
            }
          }
        }

        this.$emit('update:modelValue', `#${outputString.toUpperCase()}`)
      }
    }
  }
</script>

<style scoped lang="scss">
  .base-color-picker {
    
    &__title {
      color: #B2B2B2;
      margin-bottom: 4px;
    }

    &__wrapper {
      display: flex;
      align-items: center;
      position: relative;
      box-sizing: border-box;
      min-height: 28px;
    }

    &__color-preview {
      width: 20px;
      height: 20px;
      display: block;
      border: 1px solid #F5F5F5;
      position: absolute;
      left: 4px;

      input[type="color"] {
        visibility: hidden;
      }
    }

    &__dash {
      position: absolute;
      left: 32px;
      color: #475467;
      pointer-events: none;
    }

    input[type="text"] {
      border: none;
      border-radius: 2px;
      padding: 0;
      margin: 0;
      padding-left: 42px;
      height: 28px;
      width: 100%;
      border: 1px solid var(--black1);
      border-radius: 2px;

      &:focus {
        outline: 2px solid var(--blue);
        outline-offset: -2px;
      }
    }
  } 
</style>
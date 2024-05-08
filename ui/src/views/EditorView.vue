<template>
  <BaseStatusBarPreview 
    :name="name"
    :color="color"
    :background="background"
    :icon="icon"
  />
  <TheMain class="the-main--editor">
    <div class="the-main--editor__section-title section-title">
      Name
      <div 
        v-if="charactersLimitReached"
        class="the-main--editor__section-title-message type"
      >Maximum number of characters reached</div>
    </div>
    <div class="input">
      <input 
        type="input" 
        class="input__field" 
        placeholder="My status"
        v-model="innerName"
      >
    </div>
    <div class="the-main--editor__section-title section-title">Theme</div>
    <div class="the-main--editor__themes-wrapper">
      <BaseThemeOption 
        v-for="theme of themes"
        :key="theme.id"
        :id="theme.id"
        :color="theme.color"
        :background="theme.background"
        :active="theme.id === themeId"
        @selectTheme="onThemeSelect"
      />
      <div 
        class="the-main--editor__theme-picker" 
        @click="showChooseThemeModal = true" 
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" fill="#ACDC79"/>
          <circle cx="3" cy="12" r="3" fill="#C3B5FD"/>
          <circle cx="21" cy="12" r="3" fill="#F6D0FE"/>
          <circle cx="16.2" cy="4.2" r="3" fill="#B2CCFF"/>
          <circle cx="7.80005" cy="19.8" r="3" fill="#B9E6FE"/>
          <circle cx="7.80005" cy="4.2" r="3" fill="#FEEE95"/>
          <circle cx="16.2" cy="19.8" r="3" fill="#F9DBAF"/>
        </svg>
      </div>
    </div>
    <div class="the-main--editor__section-title section-title">Icon</div>
    <div class="the-main--editor__icon-picker">
      <div class="the-main--editor__icon-wrapper">
        <BaseIcon :icon="iconsStore.icons[icon]" />
        <span class="type">{{ icon }}</span>
      </div>
      <div class="icon-button" @click="showChooseIconModal = true">
        <div class="icon icon--adjust"></div>
      </div>
    </div>
  </TheMain>
  <TheFooter class="the-footer--editor">
    <button 
      class='button button--tertiary-destructive' 
      @click="$router.push('/')"
    >Cancel</button>
    <button 
      class='button button--tertiary'
      @click="addCustomStatus"
    >Add</button>
  </TheFooter>
  <TheChooseThemeModal 
    v-if="showChooseThemeModal"
    :name="name"
    :color="color"
    :background="background"
    :icon="icon"
    @saveTheme="onThemeSave"
    @close="showChooseThemeModal = false"
  />
  <TheChooseIconModal 
    v-if="showChooseIconModal" 
    :name="name"
    :color="color"
    :background="background"
    :icon="icon"
    @saveIcon="onIconSave"
    @close="showChooseIconModal = false"
  />
</template>

<script>
  import TheMain from '../components/TheMain.vue'
  import TheFooter from '../components/TheFooter.vue'
  import BaseStatusBarPreview from '../components/base_elements/BaseStatusBarPreview.vue'
  import BaseThemeOption from '../components/base_elements/BaseThemeOption.vue'
  import BaseIcon from '../components/base_elements/BaseIcon.vue'
  import TheChooseThemeModal from '../components/TheChooseThemeModal.vue'
  import TheChooseIconModal from '../components/TheChooseIconModal.vue'
  import { mapStores } from 'pinia'
  import { useStateStore } from '../stores/state'
  import { useIconsStore } from '../stores/icons'
  import {v4 as uuid} from 'uuid';
  import { toRaw } from "vue";

  export default {
    name: 'EditorView',
    components: {
      TheMain,
      TheFooter,
      BaseStatusBarPreview,
      BaseThemeOption,
      BaseIcon,
      TheChooseThemeModal,
      TheChooseIconModal
    },
    data() {
      return {
        showChooseThemeModal: false,
        showChooseIconModal: false,
        name: 'My status',
        color: '',
        background: '',
        icon: 'bolt',
        themeId: 0
      }
    },
    computed: {
      ...mapStores(useStateStore, useIconsStore),
      themes() {
        return this.stateStore.themes.slice(0, -1)
      },
      innerName: {
        get() {
          return this.name === 'My status' ? '' : this.name.slice(0, 30)
        },
        set(newValue) {
          this.name = newValue === '' ? 'My status': newValue.slice(0, 30)
        }
      },
      charactersLimitReached() {
        return this.innerName.length >= 30
      }
    },
    mounted () {
      this.color = this.themes[this.themeId].color
      this.background = this.themes[this.themeId].background
    },
    methods: {
      onIconSave(icon) {
        this.icon = icon
      },
      onThemeSave({color, background}) {
        this.themeId = this.themes.length
        this.color = color
        this.background = background
        this.stateStore.setLastThemeToCustom(color, background)
      },
      onThemeSelect(theme) {
        this.themeId = theme.id
        this.color = theme.color
        this.background = theme.background
        this.stateStore.setLastThemeToDefault(theme.id)
      },
      addCustomStatus() {
        const id = uuid();
        this.stateStore.addCustomStatus({
          id,
          name: this.name,
          color: this.color,
          background: this.background,
          icon: this.icon
        })
        parent.postMessage({ pluginMessage: { type: "saveCustomStatuses", data: toRaw(this.stateStore.customStatuses) } }, "*")
        this.$router.push('/')
      }
    }
  }
</script>

<style lang="scss">
  .the-main--editor {
    padding: 0 12px 12px;

    &__section-title {
      margin-top: 8px;
      margin-bottom: 4px;
      min-height: 32px;
      justify-content: space-between;
    }

    &__section-title-message.type {
      color: var(--black3);
      font-size: 10px;
    }

    &__themes-wrapper {
      display: grid;
      grid-template-columns: repeat(9, 1fr);
      gap: 6px;

      div {
        aspect-ratio: 1;
      }
    }

    &__theme-picker {
      cursor: pointer;
      position: relative;
      border-radius: 50%;
      display: flex;

      &::before {
        content: '';
        position: absolute;
        width: calc(100% + 4px);
        height: calc(100% + 4px);
        border-radius: inherit;
        background-color: #dedede;
        opacity: 0.2;
        z-index: -1;
        left: -2px;
        top: -2px;
        display: none;
      }

      &:hover {

        &::before {
          display: block;
        }
      }

      &:active {
        outline: 2px solid var(--blue);
      }
    }

    &__icon-picker {
      display: flex;
      gap: 4px;
      justify-content: space-between;
      border: 1px solid var(--black1);
      border-radius: 2px;
    }

    &__icon-wrapper {
      display: flex;
      align-items: center;
    }
  }

  .the-footer--editor {
    gap: 8px;
    justify-content: flex-end;
  }
</style>
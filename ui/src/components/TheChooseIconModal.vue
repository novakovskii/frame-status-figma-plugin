<template>
  <TheModal 
    title="Choose icon" 
    class="the-choose-icon-modal"
    :ok-action="saveIcon"
  >
    <BaseStatusBarPreview 
      :name="name"
      :color="color"
      :background="background"
      :icon="selectedIcon"
    />
    <TheSearch v-model="searchValue" />
    <div class="the-choose-icon-modal__icon-container">
      <template v-if="Object.keys(iconsFiltered).length > 0">
        <div 
          v-for="(icon, key) in iconsFiltered"
          v-html="icon"
          class="icon-button the-choose-icon-modal__icon"
          :class="{'icon-button--selected': selectedIcon === key}"
          :title="key"
          @click="onIconClick(key)"
        ></div>
      </template>
      <div v-else class="type the-choose-icon-modal__empty-state-caption">No icon found</div>
    </div>
  </TheModal>
</template>

<script>
  import TheModal from './base_elements/BaseModal.vue'
  import BaseStatusBarPreview from './base_elements/BaseStatusBarPreview.vue'
  import TheSearch from './TheSearch.vue'
  import { mapStores } from 'pinia'
  import { useIconsStore } from '../stores/icons'

  export default {
    name: "TheChooseIconModal",
    components: {
      TheModal,
      BaseStatusBarPreview,
      TheSearch
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
        searchValue: '',
        selectedIcon: null
      }
    },
    computed: {
      ...mapStores(useIconsStore),
      icons() {
        return this.iconsStore.icons
      },
      iconsFiltered() {
        return Object.keys(this.icons).
          filter((key) => key.toLowerCase().includes(this.searchValue.toLowerCase())).
          reduce((current, key) => { return Object.assign(current, { [key]: this.icons[key] })}, {});
      }
    },
    mounted() {
      this.selectedIcon = this.icon
    },
    methods: {
      onIconClick(icon) {
        this.selectedIcon = icon
      },
      saveIcon() {
        this.$emit('saveIcon', this.selectedIcon)
      }
    }
  }
</script>

<style lang="scss">
  .the-choose-icon-modal {
    
    &__icon-container {
      // display: flex;
      // flex-wrap: wrap;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      padding: 10px;
      gap: 8px;
      overflow: auto;
      max-height: 100%;

    }

    &__icon {
      aspect-ratio: 1;

      &.icon-button {
        width: unset;
        height: unset;

        &--selected {
          * {
            filter: unset !important;
            fill: #fff;
          }
        }
      }

      &:not(:focus) {
        border: 1px solid var(--black1); 
      }

      svg {
        width: 16px;
        height: 16px;
        pointer-events: none;
      }
    }

    &__empty-state-caption {
      color: var(--black3);
      text-align: center;
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      grid-column: 1/7;
    }
  }
</style>
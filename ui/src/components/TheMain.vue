<template>
  <TheSearch 
    v-if="stateStore.instruction_completed && stateStore.atLeastOneFrameSelected && !stateStore.inEditor"
    v-model="searchValue"
  />
  <div class="the-main">
    <div v-if="!stateStore.instruction_completed" class="instruction">
      <img src="https://i.giphy.com/xT8qB0lNtZrloL1ahi.webp" class="instruction__image">
      <div class="instruction__text">
        <div class="instruction__title ui-l-m">Notice:</div>
        <div class="instruction__caption ui-xs-n">Track progress through statuses on your page. Choose from standard statuses or create your own unique one. Monitor who and when changed status states.</div>
      </div>
    </div>
    <div v-else-if="stateStore.instruction_completed && !stateStore.atLeastOneFrameSelected" class="hint">
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
      <div class="hint__caption ui-xs-n">Select at least one frame on the page, then choose status</div>
    </div>
    <div v-else-if="stateStore.instruction_completed && stateStore.atLeastOneFrameSelected && !stateStore.inEditor" class="statuses">
      <BaseChipContainer :empty="statusesDefaultFiltered.length === 0">
        <BaseChip 
          v-for="status in statusesDefaultFiltered" 
          :key="status.id"
          :name="status.name"
          :id="status.id"
          :background="status.background"
          :color="status.color"
          :icon="status.icon"
          active
        />
      </BaseChipContainer>
      <div class="label-s-m" style="margin: 20px 0 10px;">Custom</div>
      <BaseChipContainer v-if="stateStore.customStatuses.length > 0" :empty="statusesCustomFiltered.length === 0">
        <BaseChip 
          v-for="status in statusesCustomFiltered" 
          :key="status.id"
          :name="status.name"
          :id="status.id"
          background="#FEEE95"
          color="#A15C07"
          icon="lni lni-star-empty"
          closeable
        />
      </BaseChipContainer>
      <div v-else class="statuses__caption ui-xs-n">
        Do you want to use your personal statuses?
        <ul>
          <li>Сlick "Add custom status"</li>
          <li>Select the name and color of the status</li>
          <li>Save the new status</li>
          <li>Use the stautus, apply or remove it</li>
        </ul>
      </div>
    </div>
  </div>
  <TheAddStatusButton v-if="stateStore.instruction_completed && stateStore.atLeastOneFrameSelected && !stateStore.inEditor" />
</template>

<script>
  import TheSearch from './TheSearch.vue'
  import BaseChipContainer from './base_elements/BaseChipContainer.vue'
  import BaseChip from './base_elements/BaseChip.vue'
  import TheAddStatusButton from './TheAddStatusButton.vue'

  import { mapStores } from 'pinia'
  import { useStateStore } from '../stores/state'

  export default {
    name: "TheMain",
    components: {
      TheSearch,
      BaseChipContainer,
      BaseChip,
      TheAddStatusButton
    },
    data () {
      return {
        searchValue: ''
      }
    },
    computed: {
      ...mapStores(useStateStore),
      statusesDefaultFiltered() {
        return this.stateStore.defaultStatuses.filter(status => status.name.toLowerCase().includes(this.searchValue.toLowerCase()))
      },
      statusesCustomFiltered() {
        return this.stateStore.customStatuses.filter(status => status.name.toLowerCase().includes(this.searchValue.toLowerCase()))
      }
    }
  }
</script>

<style scoped lang="scss">
  .the-main {
    flex: 1;
    font-family: 'Inter';
    overflow: auto;
    
    .instruction {
      padding: 10px;

      &__image {
        width: 100%;
      border-radius: 4px;
      }
      &__text {
        margin-top: 16px;
      }
      &__caption {
        margin-top: 8px;
        color: var(--color-disabled);
      }
    }

    .hint {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 10px;

      &__caption {
        margin-top: 16px;
        color: var(--color-disabled);
        text-align: center;
        max-width: 205px;
      }
    }

    .statuses {
      padding: 10px;

      &__caption {
        color: var(--color-disabled);

        ul {
          list-style-type: disc;
          padding-left: 16px;
        }

        li {
          margin-top: 4px;

          &:first-of-type {
            margin-top: 8px;
          }
        }
      }
    }
  }
</style>
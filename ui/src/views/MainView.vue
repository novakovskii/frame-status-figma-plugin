<template>
  <TheSearch v-model="searchValue" />
  <TheMain class="the-main--main">
    <div class="the-main--main__section-title section-title">Default statuses</div>
    <BaseChipContainer :empty="statusesDefaultFiltered.length === 0">
      <BaseChip 
        v-for="status in statusesDefaultFiltered" 
        :key="status.id"
        :name="status.name"
        :id="status.id"
        :background="status.background"
        :color="status.color"
        :icon="status.icon"
      />
    </BaseChipContainer>
    <div class="the-main--main__section-title section-title">
      Custom statuses
      <div class="icon-button" @click="$router.push('/editor')">
        <div class="icon icon--plus"></div>
      </div>
    </div>
    <BaseChipContainer v-if="stateStore.customStatuses.length > 0" :empty="statusesCustomFiltered.length === 0">
      <BaseChip 
        v-for="status in statusesCustomFiltered" 
        :key="status.id"
        :name="status.name"
        :id="status.id"
        :background="status.background"
        :color="status.color"
        :icon="status.icon"
        closeable
      />
    </BaseChipContainer>
    <div v-else class="type the-main--main__section-empty-state-caption">No status added</div>
  </TheMain>
  <TheFooter class="the-footer--main">
    <div class="the-footer--main__button-conainer">
      <button class='button button--tertiary'>Remove</button>
      <button class='button button--tertiary-destructive'>Remove all</button>
    </div>
    <div class="icon-button">
      <div class="icon icon--swap"></div>
    </div>
  </TheFooter>
</template>

<script>
  import TheSearch from '../components/TheSearch.vue'
  import TheMain from '../components/TheMain.vue'
  import TheFooter from '../components/TheFooter.vue'
  import BaseChipContainer from '../components/base_elements/BaseChipContainer.vue'
  import BaseChip from '../components/base_elements/BaseChip.vue'
  import { mapStores } from 'pinia'
  import { useStateStore } from '../stores/state'

  export default {
    name: 'MainView',
    components: {
      TheSearch,
      TheMain,
      TheFooter,
      BaseChipContainer,
      BaseChip
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

<style lang="scss">
  .the-main--main {
    padding: 0 8px 8px;

    &__section-title {
      justify-content: space-between;
      margin-top: 8px;
      margin-bottom: 4px;
      min-height: 32px;

      .icon-button {
        margin-right: -4px;
      }
    }

    &__section-empty-state-caption {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--black3);
    }
  }
  .the-footer--main {
    justify-content: space-between;

    &__button-conainer {
      display: flex;
      gap: 8px;
    }
  }
</style>
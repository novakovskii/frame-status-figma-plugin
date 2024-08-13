<template>
  <TheHeader class="the-header--main border-bottom">
    <TheSearch v-model="searchValue" />
    <div class="icon-button__wrapper border-left">
      <div class="icon-button" @click="$router.push('/settings')">
        <div class="icon icon--settings"></div>
      </div>
    </div>
  </TheHeader>
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
        :count="stateStore.statusesCount[status.id] ? stateStore.statusesCount[status.id] : 0"
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
        :count="stateStore.statusesCount[status.id] ? stateStore.statusesCount[status.id] : 0"
        closeable
        @remove="onCustomStatusRemove"
      />
    </BaseChipContainer>
    <div v-else class="type the-main--main__section-empty-state-caption">No status added</div>
  </TheMain>
  <TheFooter class="the-footer--main">
    <div class="the-footer--main__button-conainer">
      <button 
        class='button button--tertiary' 
        @click="showRemoveStatusesModal = true"
      >Remove</button>
      <button 
        class='button button--tertiary-destructive' 
        @click="showRemoveAllStatusesModal = true"
      >Remove all</button>
    </div>
    <div 
      class="icon-button"
      @click="update"
    >
      <div class="icon icon--swap"></div>
    </div>
  </TheFooter>
  <TheRemoveStatusesModal 
    v-if="showRemoveStatusesModal"
    @removeStatuses="onStatusesRemove"
    @close="showRemoveStatusesModal = false"
  />
  <TheRemoveAllStatusesModal 
    v-if="showRemoveAllStatusesModal"
    @removeAllStatuses="onAllStatusesRemove"
    @close="showRemoveAllStatusesModal = false"
  />
  <TheRemoveCustomStatusModal 
    v-if="showRemoveCustomStatusModal"
    :frames-with-removing-status="framesWithRemovingStatus"
    @removeCustomStatus="onCustomStatusRemove(null, true)"
    @close="showRemoveCustomStatusModal = false"
  />
</template>

<script>
  import TheHeader from '../components/TheHeader.vue'
  import TheSearch from '../components/TheSearch.vue'
  import TheMain from '../components/TheMain.vue'
  import TheFooter from '../components/TheFooter.vue'
  import BaseChipContainer from '../components/base_elements/BaseChipContainer.vue'
  import BaseChip from '../components/base_elements/BaseChip.vue'
  import { mapStores } from 'pinia'
  import { useStateStore } from '../stores/state'
  import TheRemoveStatusesModal from '../components/TheRemoveStatusesModal.vue'
  import TheRemoveAllStatusesModal from '../components/TheRemoveAllStatusesModal.vue'
  import TheRemoveCustomStatusModal from '../components/TheRemoveCustomStatusModal.vue'

  export default {
    name: 'MainView',
    components: {
      TheHeader,
      TheSearch,
      TheMain,
      TheFooter,
      BaseChipContainer,
      BaseChip,
      TheRemoveStatusesModal,
      TheRemoveAllStatusesModal,
      TheRemoveCustomStatusModal
    },
    data () {
      return {
        searchValue: '',
        showRemoveStatusesModal: false,
        showRemoveAllStatusesModal: false,
        showRemoveCustomStatusModal: false,
        framesWithRemovingStatus: [],
        removingStatusId: null
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
    },
    mounted() {
      window.addEventListener('message', (e) => {
        let messageType = e.data.pluginMessage?.type
        let messageData = e.data.pluginMessage?.data
        switch (messageType) {
          case 'setElementsWithRemovingStatus':
            // this.stateStore.setFramesWithRemovingStatus(messageData)
            this.showRemoveCustomStatusModal = true
            this.framesWithRemovingStatus = messageData
          break
        }
      })
    },
    methods: {
      onStatusesRemove() {
        parent.postMessage({ pluginMessage: { type: "removeStatuses" } }, "*")
      },
      onAllStatusesRemove() {
        parent.postMessage({ pluginMessage: { type: "removeAllStatuses" } }, "*")
      },
      onCustomStatusRemove(id, force = false) {
        if (id) this.removingStatusId = id
        parent.postMessage({ pluginMessage: { type: "removeCustomStatus", data: {id: this.removingStatusId, force} } }, "*")
      },
      update() {
        parent.postMessage({ pluginMessage: { type: "update" } }, "*")
      }
    }
  }
</script>

<style lang="scss">
  .the-header--main {

    .icon-button__wrapper {
      padding: 4px;
    }
  }

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
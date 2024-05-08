<template>
  <BaseModal 
    title="Remove statuses" 
    class="the-remove-custom-status-modal"
    :ok-action="removeCustomStatus"
    ok-text="Remove"
  >
    <div class="type the-remove-custom-status-modal__caption">This status is used in the document. It will be removed from the following frames and deleted permanently.</div>
    <div class="the-remove-custom-status-modal__frame-container">
      <div 
        class="the-remove-custom-status-modal__frame-wrapper"
        v-for="frame of framesWithRemovingStatus"
        :key="frame.id"
        @click="goToFrame(frame.id)"
      >
        <div class="icon icon--frame"></div>
        <span class="type">{{ frame.name }}</span>
      </div>
    </div>
  </BaseModal>
</template>

<script>
  import BaseModal from './base_elements/BaseModal.vue'

  export default {
    name: "TheRemoveCustomStatusModal",
    components: {
      BaseModal
    },
    props: {
      framesWithRemovingStatus: {
        type: Array,
        default: []
      }
    },
    methods: {
      removeCustomStatus() {
        this.$emit('removeCustomStatus')
      },
      goToFrame(id) {
        parent.postMessage({ pluginMessage: { type: "goToFrame", data: {id} } }, "*")
      }
    }
  }
</script>

<style scoped lang="scss">
  .the-remove-custom-status-modal{

    &__caption {
      padding: 10px;
    }

    &__frame-container {
      overflow: auto;
      max-height: 100%;
    }

    &__frame-wrapper {
      padding-left: 10px;
      display: flex;
      align-items: center;
      cursor: pointer;

      &:hover {
        background-color: #efefef;
      }

      .icon {
        cursor: inherit;
      }
    }
  }
</style>
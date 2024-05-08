<template>
  <BaseModal 
    title="Remove all statuses" 
    class="the-remove-all-statuses-modal"
    :ok-action="removeAllStatuses"
    ok-text="Remove"
  >
    <div class="type the-remove-all-statuses-modal__caption">All statuses in the document will be removed.</div>
  </BaseModal>
</template>

<script>
  import BaseModal from './base_elements/BaseModal.vue'

  export default {
    name: "TheRemoveAllStatusesModal",
    components: {
      BaseModal
    },
    methods: {
      removeAllStatuses() {
        this.$emit('removeAllStatuses')
      }
    }
  }
</script>

<style scoped lang="scss">
  .the-remove-all-statuses-modal{

    &__caption {
      padding: 10px;
    }
  }
</style>
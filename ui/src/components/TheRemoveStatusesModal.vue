<template>
  <BaseModal 
    title="Remove statuses" 
    class="the-remove-statuses-modal"
    :ok-action="removeStatuses"
    ok-text="Remove"
  >
    <div class="type the-remove-statuses-modal__caption">The statuses of all selected frames will be removed.</div>
  </BaseModal>
</template>

<script>
  import BaseModal from './base_elements/BaseModal.vue'

  export default {
    name: "TheRemoveStatusesModal",
    components: {
      BaseModal
    },
    methods: {
      removeStatuses() {
        this.$emit('removeStatuses')
      }
    }
  }
</script>

<style scoped lang="scss">
  .the-remove-statuses-modal{

    &__caption {
      padding: 10px;
    }
  }
</style>
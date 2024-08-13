<template>
  <TheHeader class="the-header--settings">
    <template #title>Settings</template>
  </TheHeader>
  <TheMain class="the-main--settings">
    <div class="the-main--settings__section-title section-title">Elements to which you can add a status</div>
    <div 
      class="checkbox" 
      v-for="(item, idx) of stateStore.validNodeTypes" 
      :key="idx"
    >
      <input :id="`node-type-${item.name}`" type="checkbox" class="checkbox__box" v-model="innerValidNodeTypes[idx]">
      <label :for="`node-type-${item.name}`" class="checkbox__label">
        <div class="the-main--settings__checkbox-icon" v-html="iconsStore.uiIcons[item.name]"></div>
        <span class="the-main--settings__checkbox-label">{{item.name}}</span>
      </label>
    </div>
  </TheMain>
  <TheFooter class="the-footer--settings">
    <button 
      class='button button--tertiary-destructive'
      @click="$router.push('/')"
    >Cancel</button>
    <button 
      class='button button--tertiary'
      @click="saveSettings"
    >Save</button>
  </TheFooter>
</template>

<script>
  import TheHeader from '../components/TheHeader.vue'
  import TheMain from '../components/TheMain.vue'
  import TheFooter from '../components/TheFooter.vue'
  import { mapStores } from 'pinia'
  import { useStateStore } from '../stores/state'
  import { useIconsStore } from '../stores/icons'
  import { toRaw } from "vue";

  export default {
    name: 'SettingsView',
    components: {
      TheHeader,
      TheMain,
      TheFooter
    },
    data () {
      return {
        innerValidNodeTypes: []
      }
    },
    computed: {
      ...mapStores(useStateStore, useIconsStore),
    },
    mounted() {
      this.innerValidNodeTypes = this.stateStore.validNodeTypes.map(item => item.enabled)
    },
    methods: {
      saveSettings() {
        this.stateStore.setValidNodeTypesFromValues(this.innerValidNodeTypes)
        parent.postMessage({ pluginMessage: { type: "saveValidNodeTypes", data: toRaw(this.stateStore.validNodeTypes) } }, "*")
        this.$router.push('/')
      }
    }
  }
</script>

<style lang="scss">
  .the-main--settings {
    padding: 0 8px 8px;

    &__checkbox-icon {
      width: 24px;
      height: 24px;
      min-width: 24px;

      * {
        fill: #000;
      }
    }

    &__checkbox-label {
      margin-left: 4px;
      text-transform: capitalize;
    }
  }

  .the-footer--settings {
    gap: 8px;
    justify-content: flex-end;
  }
</style>
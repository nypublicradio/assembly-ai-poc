<script setup lang="ts">
import { useCurrentSteamStation } from '~/composables/states'
const currentSteamStation = useCurrentSteamStation()
</script>

<template>
  <section class="pb-8">
    <h2 class="pt-4 pb-6">Closed Captioning Prototype</h2>
    <div class="grid gap-3">
      <div class="col">
        <main-player />
      </div>
      <div class="col-fixed ad300 hidden lg:block">
        <!-- <div class="ad p-3">Ad Goes here</div> -->
      </div>
      <div class="col-12 ad300 lg:hidden">
        <!-- <div class="ad p-3 mx-auto">Ad Goes here</div> -->
      </div>
    </div>
  </section>
</template>

<style lang="scss">
.ad {
  background-color: #ccc;
  width: 100%;
  max-width: 300px;
  height: 250px;
  color: black;
}
</style>

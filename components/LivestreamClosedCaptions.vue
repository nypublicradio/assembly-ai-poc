<script setup>
import { createClient } from '@supabase/supabase-js'
const config = useRuntimeConfig()
const supabase = createClient(config.supabaseUrl, config.supabaseKey)

const props = defineProps({
  playing: {
    type: Boolean,
    default: false
  }
})

// subscribe to changes to the closedCaptioning table
const captions = ref(null)
const data = supabase
  .channel('custom-filter-channel')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'closedCaptioning',
      filter: `station_id=eq.${config.stationId}`
    },
    payload => {
      if (payload.new?.current_partial_transcript) {
        captions.value = payload.new.current_partial_transcript
      }
    }
  )
  .subscribe()
</script>

<template>
  <div class="livestream-closed-captions p-2">
    <template v-if="playing">
      {{ captions }}
    </template>
  </div>
</template>

<style lang="scss">
.livestream-closed-captions {
  margin-top: 8px;
  border-top: 1px solid RGB(255, 255, 255, 0.2);
  display: flex;
  justify-content: center;
  font-size: var(--font-size-7);
  min-height: 70px;
}
</style>

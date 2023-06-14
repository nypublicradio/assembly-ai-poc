<script setup>
import { toMinutesAndSeconds } from '~/utilities/helpers'
import { createClient } from '@supabase/supabase-js'
const config = useRuntimeConfig()
const supabase = createClient(config.supabaseUrl, config.supabaseKey)

const transcripts = ref(null)
const secondsLapsed = ref(null)

// get the last 50 transcript rows
let { data, error } = await supabase
  .from('transcripts')
  .select('*')
  .eq('station_id', config.stationId)
  .limit(50)
  .order('created_at', { ascending: false })
if (data) {
  transcripts.value = data
  // get the time difference in seconds between the first and the last transcript
  secondsLapsed.value =
    new Date(data[0].transcript.created) -
    new Date(data[data.length - 1].transcript.created)
  secondsLapsed.value = parseInt(secondsLapsed.value / 1000 / 60)
}
if (error) {
  console.log(error)
}
</script>

<template>
  <div class="livestream-transcript px-6 pb-4">
    <h2 class="mb-3">What You Missed</h2>
    <p class="mb-5">
      Here is the transcript for the last {{ secondsLapsed }} seconds of our
      live broadcast:
    </p>
    <div
      v-for="(item, index) in transcripts.slice().reverse()"
      :key="index"
      class="flex mb-3"
    >
      <span class="timestamp mr-3">
        {{ toMinutesAndSeconds(item.transcript.created) }}
      </span>
      <p>{{ item.transcript.text }}</p>
    </div>
  </div>
</template>

<style lang="scss">
.livestream-transcript .timestamp {
  border: 1px solid var(--white);
  padding: 2px 8px 6px;
  border-radius: 6px;
  font-size: var(--font-size-5);
  height: 32px;
}
</style>

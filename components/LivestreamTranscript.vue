<script setup>
import { Configuration, OpenAIApi } from 'openai'
import { toMinutesAndSeconds } from '~/utilities/helpers'
import { createClient } from '@supabase/supabase-js'

const props = defineProps({
  title: {
    type: String,
    default: null
  }
})

const config = useRuntimeConfig()

const loading = ref(true)
const transcripts = ref(null)
const transcriptSummary = ref(null)

onMounted(async () => {
  // get the last 50 transcript rows
  const supabase = createClient(config.supabaseUrl, config.supabaseKey)
  let { data, error } = await supabase
    .from('transcripts')
    .select('*')
    .eq('station_id', config.stationId)
    .limit(50)
    .order('created_at', { ascending: false })

  if (data) {
    transcripts.value = data

    // loop through the transcripts and create a string of the text
    let transcriptText = ''
    data.forEach(item => {
      transcriptText += item.transcript.text + ' '
    })

    // send the transcript text to OpenAI to summarize
    const configuration = new Configuration({
      apiKey: config.openAiKey
    })
    const openAi = new OpenAIApi(configuration)
    const completion = await openAi.createCompletion({
      model: 'text-davinci-003',
      prompt: `Summarize the following text in three bullets, excluding mentions of supporting NYPR: ${transcriptText}`,
      temperature: 0.75, // temperature governs the randomness/creativity of the responses (a number between 0 and 1)
      max_tokens: 420
    })
    transcriptSummary.value = completion.data.choices[0].text
    transcriptSummary.value = transcriptSummary.value.replace(/^-/, '•') // format the results
    transcriptSummary.value = transcriptSummary.value.replace(/ -/g, '<br>• ') // format the results
    transcriptSummary.value = transcriptSummary.value.replace(/- /g, '<br>• ') // format the results

    loading.value = false
  }

  if (error) {
    console.log(error)
  }
})
</script>

<template>
  <div class="livestream-transcript px-6 pb-4">
    <h2 class="mb-2">
      What You Missed On <em>{{ title }}</em>
    </h2>
    <template v-if="loading">
      <div class="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </template>
    <template v-else>
      <p v-html="transcriptSummary" />
      <hr class="my-6" />
      <p class="mb-2">
        Here is the transcript for the last few minutes of our live broadcast:
      </p>
      <template
        v-for="(item, index) in transcripts.slice().reverse()"
        :key="index"
      >
        <div v-if="index % 3 === 0" class="mb-4" />
        <span v-if="index % 3 === 0" class="timestamp mr-3">
          {{ toMinutesAndSeconds(item.transcript.created) }}
        </span>
        {{ item.transcript.text }}
      </template>
    </template>
  </div>
</template>

<style lang="scss">
.livestream-transcript {
  line-height: 2.25rem;
  .timestamp {
    display: inline-block;
    border: 1px solid var(--white);
    padding: 2px 8px 6px;
    border-radius: 6px;
    font-size: var(--font-size-5);
    line-height: var(--font-size-8);
    height: 32px;
  }
}

.lds-ellipsis {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ellipsis div {
  position: absolute;
  top: 33px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #fff;
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}
.lds-ellipsis div:nth-child(1) {
  left: 8px;
  animation: lds-ellipsis1 0.6s infinite;
}
.lds-ellipsis div:nth-child(2) {
  left: 8px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(3) {
  left: 32px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(4) {
  left: 56px;
  animation: lds-ellipsis3 0.6s infinite;
}
@keyframes lds-ellipsis1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes lds-ellipsis3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
@keyframes lds-ellipsis2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(24px, 0);
  }
}
</style>

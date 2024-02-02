<template>
  <div class="loading-screen" ref="lottieContainer"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import lottie from 'lottie-web'

const lottieContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  if (lottieContainer.value) {
    lottie.loadAnimation({
      container: lottieContainer.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/src/assets/water-loader.json',
    })
  } else {
    console.error('Lottie container is not available')
  }
})
</script>

<style>
.loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}
</style>

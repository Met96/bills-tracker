<script setup lang="ts">
  useSeoMeta(
    {
      title: 'Bilzy',
      description: 'A modern web application that uses AI to automatically parse and track your energy and gas bills. Upload your bills, let Claude AI extract the key information, review and confirm the data, then automatically update your yearly statistics.'
    }
  )
</script>

<template>
  <div class="bg-[#f5faff]">
    <NuxtRouteAnnouncer />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
  </div>
</template>

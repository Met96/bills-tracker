<template>
  <div class="relative flex flex-wrap gap-2 text-sm">
    <button
      v-for="year in availableYears" :key="year"
      class="py-2 px-4 rounded-md cursor-pointer"
      :class="[
        { 'text-white bg-blue-800 hover:bg-blue-900': selectedYear === year},
        { 'text-gray-500 bg-gray-300 hover:text-white hover:bg-blue-900': selectedYear !== year}]"
      @click="() => $emit('change', year)"
      >
      {{ year }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{selectedYear: number}>()
defineEmits<{
  change: [year: number]
}>()

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear - 5; i <= currentYear; i++) {
    years.push(i)
  }
  return years
})
</script>

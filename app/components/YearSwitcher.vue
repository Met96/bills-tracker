<template>
  <div class="relative flex flex-wrap gap-2 text-sm">
    <button
      v-for="year in availableYears" :key="year"
      class="py-2 px-4 rounded-md font-medium transition-colors duration-300 cursor-pointer"
      :class="[
        { 'text-white bg-linear-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 shadow-lg': selectedYear === year},
        { 'text-gray-500 bg-gray-200 hover:bg-gray-300 opacity-60': selectedYear !== year}]"
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

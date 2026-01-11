<template>
  <div class="relative">
    <select
      v-model="localeRef"
      class="appearance-none bg-transparent border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      aria-label="Change locale"
      @change="switchLocale(($event.target as HTMLSelectElement).value)"
    >
      <option value="en">EN</option>
      <option value="it">IT</option>
    </select>
    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $getLocale, $switchLocale  } = useI18n()
const locale = $getLocale()

const switchLocale = (locale: string) => {
  $switchLocale(locale)
}
const localeRef = ref<string>(locale)
</script>

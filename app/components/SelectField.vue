<script setup lang="ts">
interface Props {
  modelValue: string | number
  ariaLabel?: string
  isNumber?: boolean
}


const props = defineProps<Props>()
const model = defineModel<string | number>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: []
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value

  // If isNumber prop is true, convert to number
  const finalValue = props.isNumber ? Number(value) : value
  emit('update:modelValue', finalValue)
  emit('change')
}
</script>

<template>
  <div class="relative">
    <select
      v-model="model"
      class="appearance-none bg-transparent border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-full"
      :aria-label="ariaLabel"
      @change="handleChange"
    >
      <slot />
    </select>
    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">

const { $t } = useNuxtApp()
const t = (key: string) => $t(key) as string

interface Stats {
  energyTotalCost: number
  energyTotalConsumed: number
  energyBillCount: number
  gasTotalCost: number
  gasTotalConsumed: number
  gasBillCount: number
  combinedTotalCost: number
}

const selectedYear = ref(new Date().getFullYear())
const loading = ref(true)
const error = ref<string | null>(null)
const stats = ref<Stats>({
  energyTotalCost: 0,
  energyTotalConsumed: 0,
  energyBillCount: 0,
  gasTotalCost: 0,
  gasTotalConsumed: 0,
  gasBillCount: 0,
  combinedTotalCost: 0,
})

const fetchStats = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(`/api/stats?year=${selectedYear.value}`)

    if (!response.ok) {
      throw new Error('Failed to fetch statistics')
    }

    const data = await response.json()
    stats.value = data.stats
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
    console.error('Error fetching stats:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900">{{ $t('dashboard.title') }}</h1>
        <p class="text-gray-600 mt-2">{{ $t('dashboard.subtitle') }}</p>
      </div>

      <!-- Year Selector -->
      <div class="mb-8 flex flex-col justify-center gap-2">
        <label class="text-sm font-medium text-gray-700">{{ $t('dashboard.selectYear') }}</label>
        <YearSwitcher
          :selected-year="selectedYear"
          @change="(e) => {
            selectedYear = e
            fetchStats()
          }"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <UIcon name="i-lucide-loader-circle" class="animate-spin text-blue-800 size-9" />
        <p class="text-gray-600 mt-4">{{ $t('dashboard.loadingStats') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- Stats Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Cost Card -->
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-blue-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">{{ $t('dashboard.totalCost') }}</p>
              <p class="text-4xl font-bold text-gray-900 mt-2">
                €{{ stats.combinedTotalCost.toFixed(2) }}
              </p>
            </div>
            <div class="text-blue-800 text-6xl"><UIcon name="i-lucide-euro" /></div>
          </div>
        </div>

        <!-- Energy Stats Card -->
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">{{ $t('dashboard.energyCost') }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                €{{ stats.energyTotalCost.toFixed(2) }}
              </p>
              <p class="text-gray-500 text-xs mt-1">
                {{ stats.energyTotalConsumed.toFixed(1) }} kW
              </p>
            </div>
            <div class="text-yellow-500 text-6xl"><UIcon name="i-lucide-zap" /></div>
          </div>
        </div>

        <!-- Gas Stats Card -->
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">{{ $t('dashboard.gasCost') }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                €{{ stats.gasTotalCost.toFixed(2) }}
              </p>
              <p class="text-gray-500 text-xs mt-1">
                {{ stats.gasTotalConsumed.toFixed(1) }} m³
              </p>
            </div>
            <div class="text-orange-500 text-6xl"><UIcon name="i-lucide-flame" /></div>
          </div>
        </div>

        <!-- Bills Count Card -->
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">{{ $t('dashboard.billsCount') }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ stats.energyBillCount + stats.gasBillCount }}
              </p>
              <p class="text-gray-500 text-xs mt-1">
                {{ stats.energyBillCount }} {{ t('common.energy').toLowerCase() }}, {{ stats.gasBillCount }} {{ t('common.gas').toLowerCase() }}
              </p>
            </div>
            <div class="text-green-600 text-6xl"><UIcon name="i-lucide-calculator" /></div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="">
        <div class="flex flex-col sm:flex-row gap-4">
          <NuxtLink
            to="/upload"
            class="flex-1 bg-blue-800 hover:bg-blue-900 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors flex items-center gap-2 justify-center"
          >

            <UIcon name="i-lucide-plus" class="size-5" />
            {{ $t('dashboard.uploadNewBill') }}
          </NuxtLink>
          <NuxtLink
            to="/bills"
            class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors flex items-center gap-2 justify-center"
          >
            <UIcon name="i-lucide-list-checks" class="size-5" />
            {{ $t('dashboard.viewAllBills') }}
          </NuxtLink>
        </div>
      </div>


      <!-- Breakdown Section -->
      <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Energy Details -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">
            <div class="text-yellow-500 text-3xl"><UIcon name="i-lucide-zap" /></div>
            {{ $t('dashboard.energyBreakdown') }}</h2>
          <div class="space-y-3">
            <div class="flex justify-between items-center pb-3 border-b border-b-gray-300">
              <span class="text-gray-600">{{ $t('dashboard.totalCost') }}</span>
              <span class="font-semibold">€{{ stats.energyTotalCost.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center pb-3 border-b border-b-gray-300">
              <span class="text-gray-600">{{ $t('dashboard.totalConsumption') }}</span>
              <span class="font-semibold">{{ stats.energyTotalConsumed.toFixed(1) }} kW</span>
            </div>
            <div class="flex justify-between items-center pb-3 border-b border-b-gray-300">
              <span class="text-gray-600">{{ $t('dashboard.billsCount') }}</span>
              <span class="font-semibold">{{ stats.energyBillCount }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">{{ $t('dashboard.averagePerBill') }}</span>
              <span class="font-semibold">
                {{
                  stats.energyBillCount > 0
                    ? (stats.energyTotalCost / stats.energyBillCount).toFixed(2)
                    : '0.00'
                }}
                €
              </span>
            </div>
          </div>
        </div>

        <!-- Gas Details -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">
            <div class="text-orange-500 text-3xl"><UIcon name="i-lucide-flame" /></div>
            {{ $t('dashboard.gasBreakdown') }}</h2>
          <div class="space-y-3">
            <div class="flex justify-between items-center pb-3 border-b border-b-gray-300">
              <span class="text-gray-600">{{ $t('dashboard.totalCost') }}</span>
              <span class="font-semibold">€{{ stats.gasTotalCost.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center pb-3 border-b border-b-gray-300">
              <span class="text-gray-600">{{ $t('dashboard.totalConsumption') }}</span>
              <span class="font-semibold">{{ stats.gasTotalConsumed.toFixed(1) }} m³</span>
            </div>
            <div class="flex justify-between items-center pb-3 border-b border-b-gray-300">
              <span class="text-gray-600">{{ $t('dashboard.billsCount') }}</span>
              <span class="font-semibold">{{ stats.gasBillCount }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">{{ $t('dashboard.averagePerBill') }}</span>
              <span class="font-semibold">
                {{
                  stats.gasBillCount > 0 ? (stats.gasTotalCost / stats.gasBillCount).toFixed(2) : '0.00'
                }}
                €
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

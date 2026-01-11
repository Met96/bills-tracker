<script setup lang="ts">
const { $t } = useNuxtApp()
const t = (key: string) => $t(key) as string

interface Bill {
  id: string
  billType: string
  period: string
  cost: number
  consumption: number
  unit: string
  status: string
  notes?: string
  year: number
  month?: number
  createdAt: string
}

const loading = ref(true)
const filterStatus = ref('confirmed')
const filterType = ref('')
const filterYear = ref(new Date().getFullYear())
const bills = ref<Bill[]>([])
const expandedNoteId = ref<string | null>(null)

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push(i)
  }
  return years
})

const fetchBills = async () => {
  loading.value = true

  try {
    let url = '/api/bills?'
    url += `status=${filterStatus.value}`

    if (filterStatus.value === 'confirmed') {
      url += `&year=${filterYear.value}`
    }

    if (filterType.value) {
      url += `&type=${filterType.value}`
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Failed to fetch bills')
    }

    const data = await response.json()
    bills.value = data.bills || []
  } catch (error) {
    console.error('Error fetching bills:', error)
    bills.value = []
  } finally {
    loading.value = false
  }
}

const toggleNotes = (billId: string) => {
  expandedNoteId.value = expandedNoteId.value === billId ? null : billId
}

const getBillNotes = (billId: string) => {
  const bill = bills.value.find((b) => b.id === billId)
  return bill?.notes || ''
}

const deleteBill = async (billId: string) => {
  if (!confirm(t('bills.confirmDelete'))) {
    return
  }

  try {
    const response = await fetch(`/api/bills/${billId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete bill')
    }

    bills.value = bills.value.filter((bill) => bill.id !== billId)
  } catch (error) {
    console.error('Error deleting bill:', error)
    alert('Failed to delete bill')
  }
}

watch([filterStatus,filterYear,filterType], () => {
  fetchBills()
})

onMounted(() => {
  fetchBills()
})
</script>

<template>
  <div class=" bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink to="/" class="text-gray-500 hover:text-gray-600 mb-4 inline-flex items-center gap-2">
          <UIcon name="i-lucide-chevron-left" />{{ $t('bills.backToDashboard') }}
        </NuxtLink>
        <h1 class="text-4xl font-bold text-gray-900">{{ $t('bills.title') }}</h1>
        <p class="text-gray-600 mt-2">{{ $t('bills.subtitle') }}</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <ClientOnly>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('common.status') }}</label>
              <SelectField
                v-model="filterStatus"
                aria-label="Filter by status"
              >
                <option value="pending">{{ $t('bills.pendingReview') }}</option>
                <option value="confirmed">{{ $t('common.confirmed') }}</option>
                <option value="all">{{ $t('bills.allBills') }}</option>
              </SelectField>
            </div>

            <!-- Year Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('common.year') }}</label>
              <SelectField
                v-model="filterYear"
                is-number
                aria-label="Filter by year"
              >
                <option v-for="year in availableYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </SelectField>
            </div>

            <!-- Type Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('common.type') }}</label>
              <SelectField
                v-model="filterType"
                aria-label="Filter by type"
              >
                <option value="">{{ $t('bills.allTypes') }}</option>
                <option value="energy">{{ $t('common.energy') }} (⚡)</option>
                <option value="gas">{{ $t('common.gas') }} (🔥)</option>
              </SelectField>
            </div>
          </div>
        </ClientOnly>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"/>
        <p class="text-gray-600 mt-4">{{ $t('bills.loadingBills') }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="bills.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-600 mt-4">{{ $t('bills.noBillsFound') }}</p>
        <NuxtLink
          to="/upload"
          class="inline-block mt-6 px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition"
        >
          {{ $t('bills.uploadFirstBill') }}
        </NuxtLink>
      </div>

      <!-- Bills Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{{ $t('common.type') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{{ $t('bills.period') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{{ $t('bills.cost') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{{ $t('bills.consumption') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{{ $t('common.status') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="bill in bills" :key="bill.id" class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center gap-2">
                    <span class="text-lg">
                        <UIcon v-if="bill.billType === 'energy'"  name="i-lucide-zap" class="text-yellow-500" />
                        <UIcon v-else name="i-lucide-flame" class="text-orange-500" />
                    </span>
                    <span class="font-medium text-gray-900">{{ bill.billType === 'energy' ? $t('common.energy') : $t('common.gas') }}</span>
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-900">{{ bill.period }}</td>
                <td class="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                  €{{ bill.cost.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-900">
                  {{ bill.consumption.toFixed(2) }} {{ bill.unit }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-3 py-1 rounded-full text-sm font-medium"
                    :class="{
                      'bg-yellow-100 text-yellow-800': bill.status === 'pending',
                      'bg-green-100 text-green-800': bill.status === 'confirmed',
                    }"
                  >
                    {{ bill.status === 'pending' ? `⏳ ${$t('common.pending')}` : `✓ ${$t('common.confirmed')}` }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    class="text-blue-800 hover:text-blue-900 mr-4 cursor-pointer"
                    :title="t('bills.viewNotes')"
                    @click="toggleNotes(bill.id)"
                  >
                    <UIcon name="i-lucide-info" class="size-5"/>
                  </button>
                  <button
                    class="text-red-600 hover:text-red-700 cursor-pointer"
                    :title="t('bills.deleteBill')"
                    @click="deleteBill(bill.id)"
                  >
                    <UIcon name="i-lucide-trash" class="size-5"/>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Notes Row (expandable) -->
        <div v-if="expandedNoteId" class="bg-blue-50 border-t border-gray-200 px-6 py-4">
          <p class="text-sm text-gray-700">
            <strong>{{ $t('common.notes') }}:</strong>
            {{ getBillNotes(expandedNoteId) || $t('common.noNotes') }}
          </p>
        </div>
      </div>

      <!-- Summary Stats -->
      <div v-if="bills.length > 0" class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm font-medium">{{ $t('bills.totalBills') }}</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ bills.length }}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm font-medium">{{ $t('bills.totalCost') }}</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">
            €{{ bills.reduce((sum, bill) => sum + bill.cost, 0).toFixed(2) }}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm font-medium">{{ $t('bills.averageCost') }}</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">
            €{{ (bills.reduce((sum, bill) => sum + bill.cost, 0) / bills.length).toFixed(2) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

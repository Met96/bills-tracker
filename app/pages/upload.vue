
<script setup lang="ts">
import { ref } from 'vue'

const { $t } = useNuxtApp()
const t = (key: string) => $t(key) as string

interface ParsedBillData {
  id: string
  billType: string
  period: string
  cost: number
  consumption: number
  unit: string
  confidence: number
  notes?: string
}

interface ReviewData {
  billType: string
  period: string
  cost: number
  consumption: number
  unit: string
  notes: string
}

const isDragging = ref(false)
const uploading = ref(false)
const confirming = ref(false)
const uploadError = ref<string | null>(null)
const confirmError = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const parsedBill = ref<ParsedBillData | null>(null)
const selectedFile = ref<File | null>(null)

const reviewData = ref<ReviewData>({
  billType: 'energy',
  period: '',
  cost: 0,
  consumption: 0,
  unit: 'kW',
  notes: '',
})

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0]
    uploadFile()
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    selectedFile.value = event.dataTransfer.files[0]
    uploadFile()
  }
}

const validateFile = (file: File): string | null => {
  // Check file size (10 MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return `File size exceeds 10 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
  }

  // Check file type (image formats only, no PDFs)
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ]

  if (!validTypes.includes(file.type)) {
    return `Invalid file type: ${file.type || 'unknown'}. Supported: JPG, PNG, GIF, WebP`
  }

  // Check file extension (image formats only, no PDFs)
  const fileName = file.name.toLowerCase()
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))

  if (!hasValidExtension) {
    const ext = fileName.split('.').pop() || 'unknown'
    if (ext === 'pdf') {
      return 'PDF files cannot be processed directly. Please convert your PDF to JPG or PNG first using an online converter like SmallPDF.com or by taking a screenshot.'
    }
    return `Invalid file extension: .${ext}. Supported: .jpg, .jpeg, .png, .gif, .webp`
  }

  return null
}

const uploadFile = async () => {
  if (!selectedFile.value) {
    uploadError.value = 'No file selected'
    return
  }

  // Validate file
  const validationError = validateFile(selectedFile.value)
  if (validationError) {
    uploadError.value = validationError
    return
  }

  uploading.value = true
  uploadError.value = null

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await fetch('/api/bills/parse', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.statusMessage || 'Failed to parse bill')
    }

    const data = await response.json()

    if (data.success && data.bill) {
      parsedBill.value = data.bill
      reviewData.value = {
        billType: data.bill.billType,
        period: data.bill.period,
        cost: data.bill.cost,
        consumption: data.bill.consumption,
        unit: data.bill.unit,
        notes: data.bill.notes || '',
      }
    }
  } catch (error) {
    uploadError.value = error instanceof Error ? error.message : 'Failed to parse bill'
  } finally {
    uploading.value = false
  }
}

const confirmBill = async () => {
  if (!parsedBill.value) {
    confirmError.value = 'No parsed bill data'
    return
  }

  confirming.value = true
  confirmError.value = null

  try {
    const response = await fetch(`/api/bills/${parsedBill.value.id}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData.value),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.statusMessage || 'Failed to confirm bill')
    }

    successMessage.value = `Bill successfully saved! ${reviewData.value.billType === 'energy' ? '⚡' : '🔥'}`
    setTimeout(() => {
      navigateTo('/')
    }, 2000)
  } catch (error) {
    confirmError.value = error instanceof Error ? error.message : 'Failed to confirm bill'
  } finally {
    confirming.value = false
  }
}

const resetForm = () => {
  parsedBill.value = null
  selectedFile.value = null
  reviewData.value = {
    billType: 'energy',
    period: '',
    cost: 0,
    consumption: 0,
    unit: 'kW',
    notes: '',
  }
  uploadError.value = null
  confirmError.value = null
  successMessage.value = null
  isDragging.value = false
}
</script>

<template>
  <div class="p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink to="/" class="text-gray-500 hover:text-gray-600 mb-4 inline-flex items-center gap-2">
          <UIcon name="i-lucide-chevron-left" />{{ $t('bills.backToDashboard') }}
        </NuxtLink>
        <h1 class="text-4xl font-bold text-gray-900">{{ $t('upload.title') }}</h1>
        <p class="text-gray-600 mt-2">{{ $t('upload.subtitle') }}</p>
      </div>

      <!-- File Upload Area -->
      <div v-if="!parsedBill" class="bg-white rounded-lg shadow p-8 mb-8">
        <div
          :class="isDragging ? 'border-blue-800 bg-blue-50' : 'border-gray-300'"
          class="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-blue-800 transition"
          @drop="handleDrop"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @dragenter.prevent="isDragging = true"
        >
          <div class="mb-4">
            <UIcon name="i-lucide-image-up" class="text-gray-400 size-20" />
          </div>
          <p class="text-xl font-semibold text-gray-900 mb-2">{{ $t('upload.dragAndDrop') }}</p>
          <p class="text-gray-600 mb-4">{{ $t('upload.or') }}</p>
          <label class="px-6 py-2 bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white rounded-lg transition-colors duration-300 cursor-pointer inline-block shadow-lg">
            {{ $t('upload.selectFile') }}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              class="hidden"
              @change="handleFileSelect"
            >
          </label>
          <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-sm text-blue-900 font-medium mb-2">💡 {{ $t('upload.imageFilesWork') }}</p>
            <p class="text-xs text-blue-800 mb-2">{{ $t('upload.pdfInstructions') }}</p>
            <ul class="text-xs text-blue-800 list-disc list-inside">
              <li>{{ $t('upload.pdfTip1') }}</li>
              <li>{{ $t('upload.pdfTip2') }}</li>
              <li>{{ $t('upload.pdfTip3') }}</li>
            </ul>
            <p class="text-xs text-blue-800 mt-2">{{ $t('upload.maxFileSize') }}</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="uploadError" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800 font-medium">⚠️ {{ $t('common.error') }}</p>
          <p class="text-red-700 mt-1">{{ uploadError }}</p>
          <button
            class="text-red-600 hover:text-red-700 text-sm font-medium mt-2"
            @click="uploadError = null"
          >
            {{ $t('common.dismiss') }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="uploading" class="mt-4">
          <div class="flex items-center justify-center">
            <UIcon name="i-lucide-loader-circle" class="animate-spin text-blue-800 size-9" />
            <p class="ml-4 text-gray-600">{{ $t('upload.parsingBill') }}</p>
          </div>
          <p class="text-center text-gray-500 text-sm mt-2">{{ $t('upload.parsingTime') }}</p>
        </div>
      </div>

      <!-- Parsed Bill Review -->
      <div v-if="parsedBill && !confirming" class="bg-white rounded-lg shadow p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ $t('upload.reviewParsedData') }}</h2>

        <!-- Confidence Alert -->
        <div v-if="parsedBill.confidence < 0.8" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-yellow-800">
            <strong>⚠️ {{ $t('upload.lowConfidence') }}:</strong> {{ $t('upload.lowConfidenceMsg', { confidence: (parsedBill.confidence * 100).toFixed(0) }) }}
          </p>
        </div>

        <!-- Success Alert for High Confidence -->
        <div v-if="parsedBill.confidence >= 0.8" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p class="text-green-800">
            <strong>✓ {{ $t('upload.highConfidence') }}:</strong> {{ $t('upload.highConfidenceMsg', { confidence: (parsedBill.confidence * 100).toFixed(0) }) }}
          </p>
        </div>

        <!-- Form for Validation -->
        <form class="space-y-6" @submit.prevent="confirmBill">
          <!-- Bill Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('upload.billType') }}</label>
            <select
              v-model="reviewData.billType"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="energy">⚡ {{ $t('upload.energyElectricity') }}</option>
              <option value="gas">🔥 {{ $t('common.gas') }}</option>
            </select>
          </div>

          <!-- Period -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('upload.billingPeriod') }}</label>
            <input
              v-model="reviewData.period"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="t('upload.periodPlaceholder')"
            >
            <p class="text-xs text-gray-500 mt-1">{{ $t('upload.periodFormat') }}</p>
          </div>

          <!-- Cost -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('upload.totalCostEur') }}</label>
            <input
              v-model.number="reviewData.cost"
              type="number"
              step="0.01"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            >
          </div>

          <!-- Consumption -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('upload.consumptionLabel', { unit: reviewData.unit }) }}
            </label>
            <input
              v-model.number="reviewData.consumption"
              type="number"
              step="0.01"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            >
          </div>

          <!-- Unit Display -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('upload.unit') }}</label>
            <div class="px-4 py-2 bg-gray-100 rounded-lg text-gray-900 font-medium">
              {{ reviewData.unit }}
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ $t('upload.unitAutoDetected') }}</p>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('upload.notesOptional') }}</label>
            <textarea
              v-model="reviewData.notes"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="t('upload.notesPlaceholder')"
            />
          </div>

          <!-- AI Parsed Data Display -->
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-3">{{ $t('upload.aiParsingDetails') }}</h3>
            <div class="text-sm text-gray-600 space-y-2">
              <p><strong>{{ $t('upload.detectedType') }}</strong> {{ parsedBill.billType === 'energy' ? `⚡ ${$t('common.energy')}` : `🔥 ${$t('common.gas')}` }}</p>
              <p><strong>{{ $t('upload.confidence') }}</strong> {{ (parsedBill.confidence * 100).toFixed(1) }}%</p>
              <p v-if="parsedBill.notes"><strong>{{ $t('upload.aiNotes') }}</strong> {{ parsedBill.notes }}</p>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="confirmError" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800 font-medium">{{ $t('common.error') }}</p>
            <p class="text-red-700 mt-1">{{ confirmError }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 pt-6">
            <button
              type="button"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white rounded-lg transition-colors duration-300 font-medium cursor-pointer shadow-lg"
              @click="resetForm"
            >
              {{ $t('upload.uploadAnother') }}
            </button>
            <button
              type="submit"
              :disabled="confirming"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-colors duration-300 font-medium cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ confirming ? $t('upload.saving') : `✓ ${$t('upload.confirmAndSave')}` }}
            </button>
          </div>
        </form>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div class="text-6xl mb-4">✓</div>
        <p class="text-green-800 font-bold text-xl mb-2">{{ $t('upload.billSaved') }}</p>
        <p class="text-green-700 mb-6">{{ $t('upload.billAddedMsg', { type: reviewData.billType === 'energy' ? t('common.energy').toLowerCase() : t('common.gas').toLowerCase() }) }}</p>
        <div class="flex gap-4 justify-center">
          <NuxtLink
            to="/"
            class="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-colors duration-300 font-medium cursor-pointer shadow-lg"
          >
            {{ $t('upload.backToDashboard') }}
          </NuxtLink>
          <button
            class="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white rounded-lg transition-colors duration-300 font-medium cursor-pointer shadow-lg"
            @click="resetForm"
          >
            {{ $t('upload.uploadAnotherBill') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

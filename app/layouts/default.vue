<script setup lang="ts">
const isDrawerOpen = ref(false)
</script>
<template>
  <div>
    <nav class="fixed flex justify-center w-full top-6 z-40 px-6">
      <div class="w-full lg:w-auto lg:min-w-3xl mx-auto px-4 sm:px-6 lg:px-8  bg-white/50 rounded-2xl shadow-2xl shadow-blue-900/20 backdrop-blur-2xl">
        <div class="flex justify-between items-center py-2 gap-3">
          <NuxtLink to="/" class="w-auto shrink-0">
            <NuxtImg src="../public/images/bilzy.png" :width="200" :height="60" alt="Bilzy" class="w-full max-w-32 md:max-w-48" />
          </NuxtLink>
          <div class="hidden md:flex items-center gap-3">
            <NuxtLink
              to="/bills"
              class="text-sm text-gray-700 hover:text-blue-800 font-medium transition flex items-center gap-1.5"
              active-class="text-blue-600"
            >
              <UIcon name="i-lucide-list-checks" class="size-4" />
              {{ $t('nav.bills') }}
            </NuxtLink>
            <NuxtLink
              to="/upload"
              class="py-1.5 px-3 rounded-md text-xs text-white bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 font-medium transition-colors duration-300 flex items-center gap-1.5 shadow-md"
              active-class="text-blue-600"
            >
              <UIcon name="i-lucide-plus" class="size-4" />
              {{ $t('dashboard.uploadNewBill') }}
            </NuxtLink>
            <LanguageSwitcher />
          </div>

          <!-- Mobile Menu Button -->
          <div class="flex md:hidden">
            <UIcon name="i-lucide-menu" class="size-6 cursor-pointer text-gray-700 hover:text-blue-800 transition" @click="isDrawerOpen = true"/>
          </div>
        </div>
      </div>
    </nav>

    <main class="min-h-dvh pt-28">
      <slot />
    </main>

    <!-- Mobile Drawer -->
    <div class="fixed inset-0 bg-white/80 transition-opacity duration-200" :class="[{ 'block': isDrawerOpen}, {'opacity-0 w-0': !isDrawerOpen}]" />
    <UDrawer v-model:open="isDrawerOpen" direction="right" title="Menu" description="Description" :ui="{ content: 'z-50 bg-white'}">
      <template #header><div /></template>
      <template #body>
        <div class="flex flex-col gap-y-6 p-2 bg-white">
          <NuxtLink
            to="/bills"
            class="text-gray-700 hover:text-blue-800 font-medium transition flex items-center gap-2"
            active-class="text-blue-600"
          >
            <UIcon name="i-lucide-list-checks" class="size-5" />
            {{ $t('nav.bills') }}
          </NuxtLink>
          <NuxtLink
            to="/upload"
            class="py-2 px-4 rounded-md text-white bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 font-medium transition-colors duration-300 flex items-center gap-2 shadow-lg"
            active-class="text-blue-600"
          >
            <UIcon name="i-lucide-plus" class="size-5" />
            {{ $t('dashboard.uploadNewBill') }}
          </NuxtLink>
        </div>
      </template>
    </UDrawer>
  </div>
</template>

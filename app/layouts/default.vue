<script setup lang="ts">
const isDrawerOpen = ref(false)
</script>
<template>
  <div>
    <nav class="bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6 gap-y-6 flex-wrap">
          <NuxtLink to="/" class="text-2xl font-bold text-blue-800 w-auto">
            <NuxtImg src="../public/images/bilzy.png" :width="200" :height="60" alt="Bilzy" class="w-full max-w-40 md:max-w-70" />
          </NuxtLink>
          <div class="hidden md:flex items-center gap-6 w-full md:w-auto">
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
              class="py-2 px-4 rounded-md text-white bg-blue-800 hover:bg-blue-900 font-medium transition flex items-center gap-2"
              active-class="text-blue-600"
            >
              <UIcon name="i-lucide-plus" class="size-5" />
              {{ $t('dashboard.uploadNewBill') }}
            </NuxtLink>
            <LanguageSwitcher />
          </div>

          <!-- Mobile Menu Button -->
          <div class="flex md:hidden">
            <UIcon name="i-lucide-menu" class="size-7 cursor-pointer" @click="isDrawerOpen = true"/>
          </div>
        </div>
      </div>
    </nav>

    <main>
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
            class="py-2 px-4 rounded-md text-white bg-blue-800 hover:bg-blue-900 font-medium transition flex items-center gap-2"
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

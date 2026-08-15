<template>
  <div class="min-h-screen flex flex-col bg-background">
    <SiteHeader />
    <main class="flex-1 pt-[72px]">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

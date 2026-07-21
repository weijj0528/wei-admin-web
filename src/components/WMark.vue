<template>
  <svg
    class="w-mark"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- Container — rounded frame (cockpit screen) -->
    <rect
      x="2" y="2" width="36" height="36" rx="9"
      stroke="currentColor" stroke-width="1.5" opacity="0.2"
    />
    <!-- Accent dot — cockpit status light -->
    <circle cx="10" cy="10" r="2.5" fill="#F5B042" />
    <!-- W — geometric monogram, flat center peak -->
    <path
      d="M8 14L14 30L20 20L26 30L32 14"
      stroke="currentColor" stroke-width="2.5"
      stroke-linecap="round" stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.w-mark {
  display: block;
  width: 100%;
  height: 100%;
}
</style>

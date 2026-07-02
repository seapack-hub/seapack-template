<template>
  <div
    class="card-item group relative flex items-center gap-16 p-20 rounded-[14px] cursor-pointer overflow-hidden
           bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]
           transition-all duration-300 ease-out
           hover:(translate-y-[-4px] scale-[1.01] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border-[var(--accent)])"
    :style="{ '--accent': color, '--delay': delay }"
    @click="$emit('click')"
  >
    <div
      class="absolute top-[-50%] right-[-50%] w-full h-full rounded-[50%] opacity-0 transition-opacity duration-400 pointer-events-none group-hover:opacity-15"
      :style="{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }"
    ></div>
    <div
      class="flex-shrink-0 w-44 h-44 flex items-center justify-center rounded-12 transition-transform duration-300
             group-hover:(scale-110 rotate-[-4deg])"
      :style="{ background: color }"
    >
      <Icon :name="icon" :size="iconSize" color="#fff" />
    </div>
    <div class="flex-1 min-w-0">
      <h3 class="text-[15px] font-600 color-[rgba(255,255,255,0.9)] m-0 mb-4px">{{ title }}</h3>
      <p class="text-[12px] color-[rgba(255,255,255,0.4)] m-0 leading-[1.4] truncate-2">{{ desc }}</p>
    </div>
    <div v-if="stat" class="flex-shrink-0">
      <span
        class="inline-block px-[10px] py-[2px] rounded-[10px] text-[11px] font-600
               color-[var(--accent)] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)]"
      >{{ stat }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  desc: string
  color: string
  stat?: string
  iconSize?: string
  delay?: string
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped lang="scss">
.card-item {
  animation: cardIn 0.5s ease both;
  animation-delay: var(--delay, 0s);
}

.truncate-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

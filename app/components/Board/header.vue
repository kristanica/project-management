<template>
  <UCard>
    <div class="flex flex-row items-center justify-between">
      <h1>
        {{ title }}
      </h1>

      <UButton @click="$emit('openModal')">Create new Column</UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { title } = defineProps<{
  title: string;
}>();

const emit = defineEmits(["openModal"]);
</script>

<style lang="scss" scoped></style>

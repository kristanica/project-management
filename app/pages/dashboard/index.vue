<template>
  {{ user1 }}
</template>

<script setup lang="ts">
definePageMeta({
  title: "Dashboard",
});
const user = useSupabaseUser();

const user1 = computed(() => {
  return user?.value?.email;
});
</script>

<style lang="scss" scoped></style>

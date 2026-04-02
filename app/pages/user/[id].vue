<template>
  <div>dynamic!</div>
</template>

<script setup lang="ts">
const route = useRoute();

useHead(() => {
  return {
    title: String(route.params.id),
  };
});
</script>

<style lang="scss" scoped></style>

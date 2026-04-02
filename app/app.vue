<template>
  <NuxtLayout>
    <UApp>
      <NuxtPage />
    </UApp>
  </NuxtLayout>
</template>
<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
console.log(config.public);
useHead(() => {
  const pageTitle = route.meta.title as string | undefined;
  return {
    title: pageTitle ? `${pageTitle}` : "Page Title",
  };
});
</script>

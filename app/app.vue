<template>
  <UProgress color="primary" size="xs" v-if="isMutating || isFetching" />

  <NuxtLayout>
    <UApp>
      <NuxtPage />
    </UApp>
  </NuxtLayout>
</template>
<script setup lang="ts">
import { useIsFetching, useIsMutating } from "@tanstack/vue-query";

const route = useRoute();
const config = useRuntimeConfig();
console.log(config.public);
const isMutating = useIsMutating();
const isFetching = useIsFetching();
useHead(() => {
  const pageTitle = route.meta.title as string | undefined;
  return {
    title: pageTitle ? `${pageTitle}` : "Page Title",
  };
});
</script>

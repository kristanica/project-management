<template>
  <UProgress
    color="primary"
    size="xs"
    v-if="isFetching || (isMutating > 0 && isReordering === 0)"
  />

  <NuxtLayout>
    <UApp>
      <NuxtPage />
    </UApp>
  </NuxtLayout>
</template>
<script setup lang="ts">
import { useIsFetching, useIsMutating } from "@tanstack/vue-query";

const route = useRoute();

const isMutating = useIsMutating();
const isFetching = useIsFetching();

const exception = ["reorder-column", "order-task"];

const isReordering = useIsMutating({
  predicate: (mutation) => {
    const key = mutation.options.mutationKey?.[0];
    return typeof key === "string" && exception.includes(key);
  },
});
useHead(() => {
  const pageTitle = route.meta.title as string | undefined;
  return {
    title: pageTitle ? `${pageTitle}` : "Page Title",
  };
});
</script>

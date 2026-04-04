<template>
  <div>This is the INDEx</div>
</template>

<script setup lang="ts">
onMounted(async () => {
  const user = useSupabaseUser();

  if (!user.value) {
    return navigateTo("/login");
  }

  return navigateTo("/dashboard");
});
</script>

<style scoped></style>

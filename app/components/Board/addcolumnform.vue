<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";

const emit = defineEmits<{
  onSubmit: [title: string];
}>();
const { isPending } = defineProps<{ isPending: boolean }>();

const title = ref<string>();

const onSubmit = (e: FormSubmitEvent<any>) => {
  e.preventDefault();

  if (!title.value) return;
  emit("onSubmit", title.value);
};
</script>

<template>
  <UForm @submit="onSubmit" class="flex flex-col gap-5" :state="title">
    <UFormField label="Column name">
      <UInput class="w-full" v-model="title"></UInput>
    </UFormField>

    <UButton
      :disabled="isPending"
      variant="solid"
      class="flex items-center justify-center"
      type="submit"
    >
      Create Column
    </UButton>
  </UForm>
</template>

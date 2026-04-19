<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";

const emit = defineEmits<{
  onSubmit: [title: string, color: string];
}>();
const { isColumnPending } = defineProps<{ isColumnPending: boolean }>();

const title = ref<string>();
const color = ref<string>("#FFFFFF");

const displayColor = computed(() => ({ backgroundColor: color.value }));

const onSubmit = (e: FormSubmitEvent<any>) => {
  e.preventDefault();

  if (!title.value) return;
  emit("onSubmit", title.value, color.value);
};
</script>

<template>
  <UForm @submit="onSubmit" class="flex flex-col gap-5" :state="title">
    <UFormField label="Column name">
      <UInput class="w-full" v-model="title"></UInput>
    </UFormField>

    <UPopover>
      <UButton label="Choose a color" color="neutral" variant="outline">
        <template #leading>
          <span :style="displayColor" class="size-5 rounded-full"></span>
        </template>
      </UButton>

      <template #content>
        <UFormField>
          <UColorPicker v-model="color" class="w-full p-2" />
        </UFormField>
      </template>
    </UPopover>

    <UButton
      :disabled="isColumnPending"
      variant="solid"
      class="flex items-center justify-center"
      type="submit"
    >
      Create Column
    </UButton>
  </UForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";

export type initialState = {
  column_id?: number;
  title: string;
  color: string;
  action: "create" | "edit";
};

const emit = defineEmits<{
  onSubmit: [title: string, color: string];
  onUpdate: [title: string, color: string];
}>();
const { isColumnPending, initialState } = defineProps<{
  isColumnPending: boolean;
  initialState: initialState;
}>();

const columnState = reactive<initialState>({
  title: initialState?.title ?? "",
  color: initialState?.color ?? "",
  action: initialState?.action ?? "create",
});

const displayColor = computed(() => ({
  backgroundColor: columnState.color,
}));

watch(
  () => initialState,
  (newVal) => {
    if (newVal) {
      columnState.color = newVal.color;
      columnState.title = newVal.title;
    }
  },
  { deep: true, immediate: true },
);

const onSubmit = (e: FormSubmitEvent<any>) => {
  e.preventDefault();

  if (columnState.action === "create") {
    emit("onSubmit", columnState.title, columnState.color);
    return;
  }
  emit("onUpdate", columnState.title, columnState.color);
};
</script>

<template>
  <UForm @submit="onSubmit" class="flex flex-col gap-5" :state="columnState">
    <UFormField label="Column name">
      <UInput class="w-full" v-model="columnState.title"></UInput>
    </UFormField>

    <UPopover>
      <UButton label="Choose a color" color="neutral" variant="outline">
        <template #leading>
          <span :style="displayColor" class="size-5 rounded-full"></span>
        </template>
      </UButton>

      <template #content>
        <UFormField>
          <UColorPicker v-model="columnState.color" class="w-full p-2" />
        </UFormField>
      </template>
    </UPopover>

    <UButton
      :disabled="isColumnPending"
      variant="solid"
      class="flex items-center justify-center"
      type="submit"
    >
      <p v-if="columnState.action === 'create'">Create Column</p>
      <p v-else>Update Column</p>
    </UButton>
  </UForm>
</template>

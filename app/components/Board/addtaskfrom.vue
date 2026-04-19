<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";

const taskForm = reactive<AddTask>({
  title: "",
  description: "",
  priority: "Low",
  status: "Pending",
});

const priority = ["High", "Medium", "Low"];
const status = ["Done", "Pending", "In Progress"];

defineProps<{ isTaskPending: boolean }>();

const emit = defineEmits<{
  (e: "on-submit", taskform: AddTask): void;
}>();

const submit = (e: FormSubmitEvent<AddTask>) => {
  e.preventDefault();
  emit("on-submit", { ...taskForm });
};
</script>

<template>
  <UForm class="space-y-5" :state="taskForm" @submit="submit">
    <UFormField label="Title">
      <UInput v-model="taskForm.title" class="w-full" required />
    </UFormField>

    <UFormField label="Descriptions">
      <UInput v-model="taskForm.description" class="w-full" required />
    </UFormField>

    <UFormField label="Priority">
      <USelect
        :items="priority"
        v-model="taskForm.priority"
        class="w-full"
        required
      />
    </UFormField>
    <UFormField label="Status">
      <USelect
        :items="status"
        v-model="taskForm.status"
        class="w-full"
        required
      />
    </UFormField>

    <UButton
      type="submit"
      :loading="isTaskPending"
      class="w-full flex justify-center"
    >
      Add New Task
    </UButton>
  </UForm>
</template>

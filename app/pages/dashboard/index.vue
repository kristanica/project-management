<template>
  <UContainer class="flex flex-col gap-6 py-8 min-h-screen">
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2"
    >
      <div>
        <h1
          class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
        >
          Projects
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          Manage and organize your Kanban boards.
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        label="Create Project"
        size="md"
        @click="openModal"
      />
    </div>

    <UModal
      :dismissible="false"
      title="Create a Project"
      v-model:open="showModal"
      description="Create a new project to manage"
    >
      <template #body>
        <UForm
          @submit="onSubmit"
          :schema="ProjectSchema"
          class="flex flex-col gap-5"
          :state="createProjectForm"
          @error="onError"
        >
          <UFormField label="Project Title">
            <UInput
              icon="i-lucide-folder"
              class="w-full"
              v-model="createProjectForm.title"
            ></UInput>
          </UFormField>

          <UFormField label="Description">
            <UInput
              icon="i-lucide-align-left"
              class="w-full"
              v-model="createProjectForm.description"
            ></UInput>
          </UFormField>

          <UButton
            :disabled="isPending"
            variant="solid"
            class="flex items-center justify-center w-full mt-2"
            type="submit"
          >
            Create Project
          </UButton>
        </UForm>
      </template>
    </UModal>

    <div class="w-full">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="value in projectList?.projectList || []"
          :to="{ name: 'project-id', params: { id: value.id } }"
          :key="value.id"
          class="group transition-transform hover:-translate-y-1 block h-full"
        >
          <UPageCard
            class="h-full"
            :title="value.title"
            :description="value.description"
            icon="i-lucide-folder"
          />
        </NuxtLink>
      </div>

      <div
        v-if="projectList?.projectList?.length === 0"
        class="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl"
      >
        <UIcon name="i-lucide-folder-open" class="size-12 mb-4 text-gray-400" />
        <p class="text-lg font-medium text-gray-900 dark:text-white">
          No projects yet
        </p>
        <p class="text-sm text-gray-500 mt-1">
          Get started by creating your first project.
        </p>
      </div>
    </div>

    <div
      class="flex items-center justify-center mt-auto pt-8 w-full"
      v-if="projectList?.totalPages"
    >
      <UPagination
        v-model:page="page"
        :total="projectList?.totalPages"
        :items-per-page="6"
      />
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import * as v from "valibot";
import type { FormSubmitEvent } from "@nuxt/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ProjectSchema } from "~/../schema/project.schema";
import { ref } from "vue";

definePageMeta({
  title: "Dashboard",
});
type Schema = v.InferOutput<typeof ProjectSchema>;
const showModal = ref(false);
const toast = useToast();
const { onError } = useOnError();
const page = ref<number>(1);

const createProjectForm = reactive<Project>({
  title: "",
  description: "",
});

const queryClient = useQueryClient();
const { mutate: createProject, isPending } = useMutation({
  mutationKey: ["Create Project"],
  mutationFn: async (data: Project) => {
    const res = await $fetch("/api/project/project", {
      method: "POST",
      body: {
        title: data.title,
        description: data.description,
      },
    });

    if (!res.success) {
      toast.add({
        title: String(res.data),
        description: String(res.success),
        color: "error",
      });
      return;
    }
    toast.add({
      title: String(res.success),
      description: String(res.data),
      color: "success",
    });
    showModal.value = false;
    createProjectForm.description = "";
    createProjectForm.title = "";
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projectlist"] }),
});

const { data: projectList } = useQuery({
  queryKey: ["projectlist", page],
  queryFn: async (): Promise<ProjectReturn> => {
    const res = await $fetch<ProjectResponse>(
      `/api/project/project?page=${page.value}`,
      {
        method: "GET",
      },
    );

    if (res.statusCode !== 200) {
      toast.add({
        title: res.title,
        description: String(res.data),
        color: "error",
      });
      return {
        projectList: [],
        totalPages: 0,
      };
    }

    console.log(res.data);
    return {
      projectList: res.data,
      totalPages: res.pages,
    };
  },
  staleTime: 10 * 60 * 1000,
});

const openModal = () => {
  showModal.value = true;
};

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  const parsedInfo = v.parse(ProjectSchema, event.data);

  if (!parsedInfo.description || !parsedInfo.title) {
    return;
  }
  createProject(parsedInfo);
};
</script>

<style lang="scss" scoped></style>

<template>
  <UContainer class="flex flex-col gap-2 min-h-[30%]">
    <UCard class="shrink-0">
      <div class="flex flex-row items-center justify-between">
        <h1 class="text-4xl font-bold tracking-widest">PROJECTS</h1>
        <UButton
          label="Create a Project"
          color="neutral"
          variant="subtle"
          @click="openModal"
        />
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
                  icon="i-lucide-user"
                  class="w-full"
                  v-model="createProjectForm.title"
                ></UInput>
              </UFormField>

              <UFormField label="Description Description">
                <UInput
                  icon="i-lucide-user"
                  class="w-full"
                  v-model="createProjectForm.description"
                ></UInput>
              </UFormField>

              <UButton
                :disabled="isPending"
                variant="solid"
                class="flex items-center justify-center"
                type="submit"
              >
                Create Project
              </UButton>
            </UForm>
          </template>
        </UModal>
      </div>
    </UCard>

    <UContainer class="flex-2">
      <div class="grid grid-cols-2 gap-5 mt-10">
        <NuxtLink
          v-for="value in projectList?.projectList || []"
          :to="{ name: 'project-id', params: { id: value.id } }"
          :key="value.id"
        >
          <UPageCard
            variant="soft"
            :title="value.title"
            :description="value.description"
            icon="i-simple-icons-tailwindcss"
            target="_blank"
          />
        </NuxtLink>
      </div>
    </UContainer>

    <div class="flex items-center justify-center mt-10 flex-1 0">
      <UPagination
        v-model:page="page"
        color="neutral"
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

    if (res.statusCode !== 200) {
      toast.add({
        title: String(res.statusCode),
        description: String(res.statusMessage),
        color: "error",
      });
      return;
    }
    toast.add({
      title: String(res.statusCode),
      description: String(res.statusMessage),
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

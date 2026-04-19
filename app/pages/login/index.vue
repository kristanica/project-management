<template>
  <div class="flex flex-col items-center min-h-screen justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UIcon name="i-lucide-user" class="size-10 mx-auto"></UIcon>

      <h1 class="text-center">Enter your credentials to create.</h1>
      <UForm
        @error="onError"
        :schema="loginSchema"
        :state="loginForm"
        @submit="onSubmit"
        class="flex flex-col gap-5"
      >
        <UFormField label="Email">
          <UInput
            v-model="loginForm.email"
            placeholder="Enter your email"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Password">
          <UInput
            type="password"
            v-model="loginForm.password"
            placeholder="Enter your email"
            class="w-full"
          />
        </UFormField>
        <USeparator class="my-5"></USeparator>

        <UButton
          type="submit"
          size="md"
          color="neutral"
          variant="outline"
          class="flex items-center justify-center"
        >
          Login
        </UButton>

        <p class="mx-auto">
          Dont have an accont?
          <NuxtLink :to="{ name: 'register' }" class="cursor-pointer">
            <UButton variant="link" class="cursor-pointer"> Register </UButton>
          </NuxtLink>
        </p>
      </UForm>
    </UPageCard>
  </div>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import * as v from "valibot";

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const toast = useToast();

const loginSchema = v.object({
  email: v.pipe(
    v.string("Must be a string"),
    v.email("Must be a valid email"),
    v.endsWith("@gmail.com", "Must be a valid gmail"),
  ),
  password: v.pipe(
    v.string("Must be a string"),
    v.minLength(8, "must be 8 characters"),
  ),
});

type Schema = v.InferOutput<typeof loginSchema>;

const loginForm = reactive<Omit<formType, "confirmPassword">>({
  email: "",
  password: "",
});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  const parsedInfo = v.parse(loginSchema, event.data);

  try {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.signInWithPassword({
      email: parsedInfo.email,
      password: parsedInfo.password,
    });

    if (error) {
      toast.add({
        title: "Login Failed",
        description: error.message, // Show the actual error
        color: "error",
      });
      return;
    }

    if (authUser) {
      toast.add({
        title: "Login successful!",
        description: "Welcome123",
        color: "success",
      });

      setTimeout(() => {
        navigateTo("/dashboard", { replace: true });
      }, 500);
    }
  } catch (e) {
    toast.add({
      title: "Login Error!",
      description: "Something went wrong...",
      color: "error",
    });
  }
};

const { onError } = useOnError();
definePageMeta({
  layout: "nonauth",
});
</script>

<style scoped></style>

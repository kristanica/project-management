<script setup lang="ts">
import { user } from "#build/ui";
import type { FormSubmitEvent } from "@nuxt/ui";

import * as v from "valibot";

const supabase = useSupabaseClient();

const registerSchema = v.pipe(
  v.object({
    username: v.pipe(
      v.string("Username must be a string"),
      v.minLength(5, "Username must have 5 characters"),
    ),
    email: v.pipe(
      v.string("Email must be a string"),
      v.email("Invalid Email"),
      v.endsWith("@gmail.com", "Email must be a Gmail"),
    ),
    password: v.pipe(
      v.string("Password must be a string"),
      v.minLength(8, "Password must have 8 characters"),
    ),
    confirmPassword: v.pipe(
      v.string("Confirm password must be a string"),
      v.minLength(8, "Confirm password must have 8 characters"),
    ),
  }),
  v.forward(
    v.partialCheck(
      [["password"], ["confirmPassword"]],
      (input: { password: string; confirmPassword: string }) =>
        input.password === input.confirmPassword,
      "Passwords do not match",
    ),
    ["confirmPassword"],
  ),
);

const toast = useToast();
type SchemaType = v.InferOutput<typeof registerSchema>;

const registerForm = reactive<formType>({
  email: "",
  password: "",
  confirmPassword: "",
  username: "",
});

const onSubmit = async (payload: FormSubmitEvent<SchemaType>) => {
  const { data, error } = await supabase.auth.signUp({
    email: payload.data.email,
    password: payload.data.password,
  });

  if (error) {
    toast.add({
      title: "Signup Failed",
      description: error.message,
      color: "error",
    });
    return;
  }

  toast.add({
    title: "Account Created",
    description: "Use your credentials to proceed",
    color: "success",
  });

  await $fetch("/api/register/register", {
    method: "POST",
    body: {
      id: data.user?.id,
      username: payload.data.username,
    },
  });

  navigateTo("/login");
};
const { onError } = useOnError();

definePageMeta({
  layout: "nonauth",
});
</script>

<template>
  <div class="flex flex-col items-center min-h-screen justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UIcon name="i-lucide-user" class="size-10 mx-auto"></UIcon>

      <h1 class="text-center">
        Enter your credentials to access your account.
      </h1>
      <UForm
        @error="onError"
        :schema="registerSchema"
        :state="registerForm"
        @submit="onSubmit"
        class="flex flex-col gap-5"
      >
        <UFormField label="Username">
          <UInput
            v-model="registerForm.username"
            placeholder="Enter your username"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Email">
          <UInput
            v-model="registerForm.email"
            placeholder="Enter your email"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Password">
          <UInput
            type="password"
            v-model="registerForm.password"
            placeholder="Enter your email"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Confirm Password">
          <UInput
            type="password"
            v-model="registerForm.confirmPassword"
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
          Register
        </UButton>

        <p class="mx-auto">
          Already have an account?
          <NuxtLink :to="{ name: 'login' }" class="cursor-pointer">
            <UButton variant="link" class="cursor-pointer"> Login </UButton>
          </NuxtLink>
        </p>
      </UForm>
    </UPageCard>
  </div>
</template>

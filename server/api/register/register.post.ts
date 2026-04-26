import { object, safeParse, string } from "valibot";
import { tryCatch } from "~~/shared/tryCatch";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const validated = safeParse(
    object({
      id: string(),
      username: string(),
    }),
    body,
  );
  if (!validated.success) {
    return {
      statusCode: 400,
      statusMessage: "Validation Failed",
      data: validated.issues,
    };
  }

  const [data, error] = await tryCatch(
    prisma.profiles.create({
      data: {
        id: validated.output.id,
        username: validated.output.username,
      },
    }),
  );

  if (error) {
    return {
      statusCode: 500,
      statusMessage: "Failed to create profile",
    };
  }

  return {
    statusCode: 201,
    success: true,
    data: data,
  };
});

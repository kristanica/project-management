import { serverSupabaseUser } from "#supabase/server";

import { ProjectSchema } from "~/../schema/project.schema";
import { safeParse } from "valibot";
import { prisma } from "~/../server/utils/prisma";
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  try {
    const content = await readBody(event);

    const result = safeParse(ProjectSchema, content);

    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: "Validation Failed",
        data: result.issues,
      });
    }
    const project = await prisma.projects.create({
      data: {
        title: result.output.title,
        description: result.output.description,
        user_id: user.sub,
      },
    });

    await prisma.boards.create({
      data: {
        title: project.title,
        project_id: project.id,
      },
    });

    const safeData = toSafeData(project);
    return {
      success: true,
      data: String(safeData),
    };

    // create is from supabase function
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create project",
    });
  }
});

import { serverSupabaseUser } from "#supabase/server";
import { Prisma } from "@prisma/client";
import { prisma, toSafeData } from "~~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const currentPage = Number(query.page) | 1;
  const user = await serverSupabaseUser(event);

  try {
    const postPerPage = 6;
    const from = (currentPage - 1) * currentPage;
    const to = from + postPerPage - 1;
    if (!user?.sub) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }
    const { projects, count } = await prisma.$transaction(async (tx) => {
      const projects = await tx.projects.findMany({
        where: {
          user_id: String(user.sub),
        },
        select: {
          id: true,
          title: true,
          description: true,
        },
        orderBy: {
          created_at: "desc",
        },
        skip: from,
        take: to - from + 1,
      });

      const count = await tx.projects.count({
        where: { user_id: String(user?.sub) },
      });

      return { projects, count };
    });

    const safeData = toSafeData(projects);
    return {
      title: "Data retrieved",
      data: safeData,
      pages: count,
      statusCode: 200,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma request error:", error.code, error.message);

      return {
        title: error.name,
        statusCode: error.code,
        data: error.message,
      };
    }
  }
});

//  ((EXISTS ( SELECT 1
//    FROM (projects p
//      JOIN project_members pm ON ((pm.project_id = p.id)))
//   WHERE (pm.user_id = ( SELECT auth.uid() AS uid))
//  LIMIT 1)) OR (EXISTS ( SELECT 1
//    FROM projects)));

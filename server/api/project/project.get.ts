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

    const [data, count] = await Promise.all([
      prisma.projects.findMany({
        where: { user_id: String(user?.sub) },
        select: {
          id: true,
          title: true,
          description: true,
        },
        orderBy: { created_at: "desc" },
        skip: from,
        take: to - from + 1,
      }),
      prisma.projects.count({
        where: { user_id: String(user?.sub) },
      }),
    ]);
    const safeData = toSafeData(data);
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

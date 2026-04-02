import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const currentPage = Number(query.page) | 1;
  const user = await serverSupabaseUser(event);
  const client = await serverSupabaseClient(event);

  const postPerPage = 6;
  const from = (currentPage - 1) * currentPage;
  const to = from + postPerPage - 1;
  const { data, error, count } = await client
    .from("projects")
    .select("id,title,description,status", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)
    .eq("user_id", String(user?.sub));

  if (error) {
    return {
      title: error.name,
      statusCode: error.code,
      data: error.message,
    };
  }

  return {
    title: "Data retrieved",
    data: data,
    pages: count,
    statusCode: 200,
  };
});

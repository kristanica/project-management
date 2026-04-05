import { serverSupabaseClient } from "#supabase/server";
export default defineEventHandler(
  async (event): Promise<ServerResponseSucceed<Board> | ServerResponseFail> => {
    const query = getQuery(event);
    const projectId = query.project_id as any | 0;

    const client = await serverSupabaseClient(event);
    const { data, error } = await client
      .from("boards")
      .select(
        "*,columns(id,title, tasks(id,column_id,title,description,priority, status))",
      )
      .eq("project_id", projectId)
      .single()
      .overrideTypes<Board[]>();

    if (error) {
      return {
        title: error.name,
        statusCode: Number(error.code),
        data: error.message,
      };
    }

    return {
      title: "Data retrieved",
      data: data,
      statusCode: 200,
    };
  },
);

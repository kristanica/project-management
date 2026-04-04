import * as v from "valibot";

export const BoardSchema = v.object({
  title: v.string(),
  created_at: v.string(),
  id: v.number(),
  project_id: v.number(),
  tasks: v.array(
    v.object({
      id: v.number(),
      title: v.string(),
      description: v.string(),
      priority: v.string(),
    }),
  ),
  columns: v.array(
    v.object({
      id: v.number(),
      title: v.string(),
    }),
  ),
});

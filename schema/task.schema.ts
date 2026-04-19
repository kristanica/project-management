import * as v from "valibot";

export const TaskSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1, "Must be more than 1 characters")),

  description: v.pipe(
    v.string(),
    v.minLength(1, "Must be more than 1 characters"),
  ),
  priority: v.pipe(
    v.string(),
    v.minLength(1, "Must be more than 1 characters"),
  ),
  status: v.pipe(v.string(), v.minLength(1, "Must be more than 1 characters")),
});

export const TaskSchemaBackend = v.object({
  title: v.pipe(v.string(), v.minLength(1, "Must be more than 1 characters")),

  description: v.pipe(
    v.string(),
    v.minLength(1, "Must be more than 1 characters"),
  ),
  priority: v.pipe(
    v.string(),
    v.minLength(1, "Must be more than 1 characters"),
  ),
  status: v.pipe(v.string(), v.minLength(1, "Must be more than 1 characters")),
  boardId: v.number(),
  projectId: v.number(),
  columnId: v.number(),
  order: v.number(),
});

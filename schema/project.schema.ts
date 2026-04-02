import * as v from "valibot";

export const ProjectSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1, "Must be more than 1 characters")),
  description: v.pipe(
    v.string(),
    v.minLength(1, "Must be more than 1 characters"),
  ),
});

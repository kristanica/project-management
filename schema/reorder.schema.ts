import * as v from "valibot";

export const reOrderSchema = v.object({
  oldCol: v.object({
    id: v.number(),
    order: v.number(),
  }),
  newCol: v.object({
    id: v.number(),
    order: v.number(),
  }),
});

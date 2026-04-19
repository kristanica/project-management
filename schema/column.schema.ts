import * as v from "valibot";

export const ColumnSchema = v.object({
  title: v.string(),
  board_id: v.number(),
  order: v.number(),
  color: v.string(),
});

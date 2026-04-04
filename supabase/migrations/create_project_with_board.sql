create or replace function create_project_with_board (
  p_title,
  p_description,
  p_user_id,
  b_title default "Default Template"
) returns table (project_id uuid, board_id uuid) language plpgsql as $$
declare
  v_project_id integer;
  v_board_id integer
begin

INSERT INTO projects (title, description, user_id)
-- values(p_title, p_description, p_user_id),
values(p_title, p_description, p_user_id),
returning id into v_project_id

INSERT INTO board(title, project_id)
-- values (b_title, v_project_id)
values (b_title, v_project_id)

returning id into v_board_id


return query select v_project_id, b_board_id
end
$$
-- 42aa8edb-67a7-4930-87de-7cd3a1b4c8b0
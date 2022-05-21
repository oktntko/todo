type Category = {
  category_id: number;
  category_name: string;
  updated_at: string;
};

type Todo = {
  todo_id: number;
  yarukoto: string;
  category_name?: string | null;
  kizitu?: string | null;
  yusendo?: string | null;
  updated_at: string;
};

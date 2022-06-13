type Version = { updated_at: string };

type Weaken<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? unknown : T[P];
};

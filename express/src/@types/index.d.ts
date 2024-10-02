type AwaitedReturnType<T> = Awaited<ReturnType<T>>;

type RequireOne<T, K extends keyof T = keyof T> = K extends keyof T ? PartialRequire<T, K> : never;

type PartialRequire<O, K extends keyof O> = {
  [P in K]-?: O[P];
} & O;

type CommonColumn = 'created_at' | 'created_by' | 'updated_at' | 'updated_by';

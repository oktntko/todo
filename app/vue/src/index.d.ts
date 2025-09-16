type CommonColumn = 'created_at' | 'created_by' | 'updated_at' | 'updated_by';

type OmitCommon<T> = Omit<T, 'created_at' | 'created_by' | 'updated_by'>;

type AwaitedReturnType<T> = Awaited<ReturnType<T>>;

// https://zenn.dev/wintyo/articles/0f0e7e86a3361f
type Join<K, P> = K extends string
  ? P extends string
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...never[]];

type Paths<T, D extends number = 10> = D extends never
  ? never
  : T extends object
    ? {
        [K in keyof T]-?: K extends string ? K | Join<K, Paths<T[K], Prev[D]>> : never;
      }[keyof T]
    : '';

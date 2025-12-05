import type { IntrinsicElementAttributes } from 'vue';
import type { RouterLink, RouterLinkProps } from 'vue-router';

type Tag = keyof IntrinsicElementAttributes | typeof RouterLink;

type Props<T extends Tag> = T extends keyof IntrinsicElementAttributes
  ? IntrinsicElementAttributes[T]
  : RouterLinkProps;

export default function MyButton<T extends Tag = 'button'>(
  props: {
    tag?: T;
    color?: 'white' | 'gray' | 'green' | 'red' | 'blue' | 'yellow';
    variant?: 'outlined' | 'contained';
  } & Props<T>,
  { slots }: { slots: { default?: () => void } },
) {
  const { tag: Tag = 'button', color = 'white', variant = 'outlined', ...rest } = props;

  return (
    <Tag
      {...rest}
      class={[
        'inline-flex items-center justify-center gap-0.5 transition',
        'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
        'min-w-28 rounded-md border px-4 py-2 hover:ring-2 focus:ring-2 focus:outline-none',
        color === 'white' &&
          (variant === 'outlined'
            ? 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:ring-gray-300 focus:ring-gray-300'
            : 'border-transparent bg-white text-gray-900 hover:bg-gray-50 hover:ring-gray-300 focus:ring-gray-300'),
        color === 'gray' &&
          (variant === 'outlined'
            ? 'border-gray-600 bg-white text-gray-900 hover:bg-gray-50 hover:ring-gray-600 focus:ring-gray-600'
            : 'border-transparent bg-gray-300 text-gray-900 hover:bg-gray-400 hover:ring-gray-500 focus:ring-gray-500'),
        color === 'green' &&
          (variant === 'outlined'
            ? 'border-green-600 bg-white text-green-600 hover:bg-green-50 hover:ring-green-600 focus:ring-green-600'
            : 'border-transparent bg-green-600 text-white hover:bg-green-700 hover:ring-green-800 focus:ring-green-800'),
        color === 'red' &&
          (variant === 'outlined'
            ? 'border-red-600 bg-white text-red-600 hover:bg-red-50 hover:ring-red-600 focus:ring-red-600'
            : 'border-transparent bg-red-600 text-white hover:bg-red-700 hover:ring-red-800 focus:ring-red-800'),
        color === 'blue' &&
          (variant === 'outlined'
            ? 'border-blue-600 bg-white text-blue-600 hover:bg-blue-50 hover:ring-blue-600 focus:ring-blue-600'
            : 'border-transparent bg-blue-600 text-white hover:bg-blue-700 hover:ring-blue-800 focus:ring-blue-800'),
        color === 'yellow' &&
          (variant === 'outlined'
            ? 'border-yellow-600 bg-white text-yellow-600 hover:bg-yellow-50 hover:ring-yellow-600 focus:ring-yellow-600'
            : 'border-transparent bg-yellow-600 text-white hover:bg-yellow-700 hover:ring-yellow-800 focus:ring-yellow-800'),
      ]}
    >
      {slots.default?.()}
    </Tag>
  );
}

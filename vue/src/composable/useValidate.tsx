import { diff as difference } from 'deep-object-diff';
import * as R from 'remeda';
import type { FunctionalComponent, HTMLAttributes } from 'vue';
import { type Ref } from 'vue';
import { z } from 'zod';
import { useDialog } from '~/plugin/DialogPlugin';

interface Props<T> extends /* @vue-ignore */ HTMLAttributes {
  for: Paths<T>;
}

export function useValidate<T extends z.ZodRawShape>(
  schema: z.ZodEffects<z.ZodObject<T>> | z.ZodObject<T>,
  modelValue: Ref<z.infer<typeof schema>>,
) {
  // initial value
  const initialValue = ref(R.clone(modelValue.value)) as Ref<z.infer<typeof schema>>;

  const diff = computed(() => difference(initialValue.value, modelValue.value));

  const isDirty = computed(() => !R.isEmpty(diff.value as ReadonlyArray<unknown>));

  // error object
  type SafeParseReturnType = AwaitedReturnType<typeof schema.safeParseAsync>;
  const error = ref<z.ZodFormattedError<SafeParseReturnType>>();

  // watch model & run validate
  watch(
    () => R.clone(modelValue.value),
    async (currentValue) => {
      const validateResult = await schema.safeParseAsync(currentValue);
      if (validateResult.success) {
        error.value = undefined;
      } else {
        error.value = validateResult.error.format();
      }
    },
  );

  const isInvalid = computed(() => !!error.value);

  const submitCount = ref(0);

  // バリデーションする
  function validateSubmit(
    callback: (value: z.infer<typeof schema>) => void,
    onInvalidSubmit: (
      eroor: z.ZodFormattedError<SafeParseReturnType>,
    ) => void = handleInvalidSubmit,
  ) {
    return async (_?: Event) => {
      submitCount.value++;

      // 値が変更されていないこともあるのでバリデーションする
      const validateResult = await schema.safeParseAsync(modelValue.value);

      if (validateResult.success) {
        submitCount.value = 0;
        return callback(validateResult.data);
      } else {
        error.value = validateResult.error.format();
        return onInvalidSubmit ? onInvalidSubmit(error.value) : undefined;
      }
    };
  }

  function revert() {
    modelValue.value = R.clone(initialValue.value) as z.infer<typeof schema>;
  }

  function reset(resetlValue: z.infer<typeof schema>) {
    modelValue.value = R.clone(resetlValue);
    initialValue.value = resetlValue;
  }

  const dialog = useDialog();
  async function handleInvalidSubmit(error: z.ZodFormattedError<unknown>) {
    if (import.meta.env.DEV) console.log(error);

    return dialog.alert('入力値に誤りがあります。');
  }

  const ErrorMessage: FunctionalComponent<Props<z.infer<typeof schema>>> = (props) => {
    const keys: string[] = props.for.split('.').filter((key: string) => key);

    const message = computed<string | undefined>(() => {
      const diffValue = R.pathOr(diff.value, keys, undefined); // 自分のキーの差分を取り出す
      // サブミット済みならエラーメッセージを表示する
      // 差分がなければエラーメッセージを表示しない
      if (submitCount.value === 0 && diffValue === undefined) {
        return;
      }

      const errorValue: any = R.pathOr(error.value, keys, undefined); // 自分のキーのエラーを取り出す
      if (
        !errorValue ||
        R.isEmpty(errorValue) ||
        !Array.isArray(errorValue._errors) ||
        !errorValue._errors.length
      ) {
        return;
      }
      return errorValue._errors[0];
    });

    if (message.value) {
      return <span>{message.value}</span>;
    } else {
      return <></>;
    }
  };

  return {
    diff,
    error,
    isInvalid,
    isDirty,
    revert,
    reset,
    submitCount,
    validateSubmit,
    ErrorMessage,
  };
}

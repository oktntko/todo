import { R } from '@todo/lib/remeda';
import type { z } from '@todo/lib/zod';
import microdiff from 'microdiff';
import type { FunctionalComponent, HTMLAttributes } from 'vue';
import { type Ref } from 'vue';
import { useDialog } from '~/plugin/DialogPlugin';

interface Props<T> extends /* @vue-ignore */ HTMLAttributes {
  for: Paths<T>;
}

export function useValidate<T extends z.ZodRawShape>(
  schema: z.ZodEffects<z.ZodObject<T>> | z.ZodObject<T>,
  modelValue: Ref<z.infer<typeof schema>>,
) {
  // initial value
  const initialValue = ref(R.clone(modelValue.value));

  const diff = computed(() =>
    microdiff(initialValue.value, modelValue.value, { cyclesFix: false }).map((x) =>
      x.path.join('.'),
    ),
  );

  const isDirty = computed(() => diff.value.length > 0);

  // error object
  const error = ref<Map<string, string[]>>(new Map());

  // watch model & run validate
  watch(modelValue.value, validate);

  async function validate(value: z.infer<typeof schema>) {
    const validateResult = await schema.safeParseAsync(value);

    if (validateResult.success) {
      error.value.clear();
    } else {
      error.value = validateResult.error.issues.reduce((map, issue) => {
        const key = issue.path.join('.');
        const messages = map.get(key);
        if (messages) {
          messages.push(issue.message);
        } else {
          map.set(key, [issue.message]);
        }

        return map;
      }, new Map<string, string[]>());
    }

    return validateResult;
  }

  const isInvalid = computed(() => error.value.size !== 0);

  const submitCount = ref(0);

  // バリデーションする
  function validateSubmit(
    callback: (value: z.infer<typeof schema>) => void,
    onInvalidSubmit: (eroor: Map<string, string[]>) => void = handleInvalidSubmit,
  ) {
    return async () => {
      submitCount.value++;

      // 値が変更されていないこともあるのでバリデーションする
      const validateResult = await validate(modelValue.value);

      if (validateResult.success) {
        submitCount.value = 0;
        return callback(validateResult.data);
      } else {
        if (import.meta.env.DEV) console.error(validateResult.error);
        return onInvalidSubmit ? onInvalidSubmit(error.value) : undefined;
      }
    };
  }

  function revert() {
    modelValue.value = R.clone(initialValue.value);
  }

  function reset(resetlValue: z.infer<typeof schema>) {
    modelValue.value = R.clone(resetlValue);
    initialValue.value = resetlValue;
  }

  const dialog = useDialog();
  async function handleInvalidSubmit() {
    return dialog.alert('入力値に誤りがあります。');
  }

  const ErrorMessage: FunctionalComponent<Props<z.infer<typeof schema>>> = (props) => {
    const message = computed<string | undefined>(() => {
      // サブミット済みならエラーメッセージを表示する
      // 差分がなければエラーメッセージを表示しない
      if (submitCount.value === 0 && !diff.value.includes(props.for)) {
        return;
      }

      const errorMessages = error.value.get(props.for);
      if (errorMessages && errorMessages.length > 0) {
        return errorMessages[0];
      }
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

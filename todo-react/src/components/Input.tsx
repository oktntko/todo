import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useCallback, useEffect, useState } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { MdClear } from "react-icons/md";
import { ProjectIcon } from "./Image";

export type UploadInputProps = {
  htmlId: string;
  dataId: string | number;
  name: string;
  value: File | null;
  onChange: (e: { target: { name: string; value: File | null } }) => void;
  previewClassName?: string;
};

export function ImageInput(props: UploadInputProps) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (props.value) {
      setPreview(window.URL.createObjectURL(props.value));
    } else {
      setPreview("");
    }
  }, [props.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      const file = e.currentTarget.files[0];
      props.onChange({ target: { name: props.name, value: file } });
    } else {
      props.onChange({ target: { name: props.name, value: null } });
    }
  };

  return (
    <label htmlFor={props.htmlId} className="flex cursor-pointer items-center space-x-2">
      {preview ? (
        <img src={preview} className={`h-12 w-12 ${props.previewClassName}`} />
      ) : (
        <ProjectIcon
          className={props.previewClassName}
          project_id={typeof props.dataId === "string" ? undefined : props.dataId}
        />
      )}
      {/* インプット(非表示) */}
      <input
        id={props.htmlId}
        type="file"
        onChange={handleChange}
        className={"hidden"}
        accept="image/*"
      />
    </label>
  );
}

type MultipleSelectProps<V> = {
  multiple: true;
  value: V[];
  onChange: (e: { target: { name: string; value: V[] } }) => void;
};

type SingleSelectProps<V> = {
  multiple?: false;
  value: V | null;
  onChange: (e: { target: { name: string; value: V | null } }) => void;
};

export type SelectInputProps<V, T> = (SingleSelectProps<V> | MultipleSelectProps<V>) & {
  name: string;
  placeholder?: string;
  options: T[];
  optionId: (option: T) => V;
  optionStyle: (option?: T | undefined) => JSX.Element;
};

export function SelectInput<V extends string | number, T>(props: SelectInputProps<V, T>) {
  const isNotEmpty = props.multiple ? props.value?.length : props.value;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = useCallback((value: any) => {
    props.onChange({ target: { name: props.name, value } });
  }, []);

  const button = () => {
    if (isNotEmpty) {
      if (props.multiple) {
        return (
          <div className={"flex flex-wrap items-center space-x-1"}>
            {props.options
              .filter((option) => ~props.value?.indexOf(props.optionId(option)))
              .map((option) => {
                return (
                  <div key={props.optionId(option)} className={"flex items-center space-x-1"}>
                    {props.optionStyle(option)}
                  </div>
                );
              })}
          </div>
        );
      } else {
        const option = props.options.find((option) => props.value === props.optionId(option));
        return (
          <div className={"flex items-center space-x-1 hover:text-blue-600"}>
            {props.optionStyle(option)}
          </div>
        );
      }
    } else {
      return (
        <label className="flex cursor-pointer flex-nowrap items-center">
          {props.optionStyle()}
          <span className="truncate text-gray-400">{props.placeholder}</span>
        </label>
      );
    }
  };

  return (
    <Listbox multiple={props.multiple} value={props.value} onChange={handleChange} as="div">
      <Listbox.Button className={"flex items-center space-x-1"}>
        {button()}
        <button
          className={`${isNotEmpty ? "" : "invisible"}`}
          type="button"
          onClick={() => (props.multiple ? handleChange([]) : handleChange(null))}
        >
          <MdClear className="text-gray-400" aria-hidden="true" />
        </button>
      </Listbox.Button>
      <Transition
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <div className="relative z-10">
          <Listbox.Options
            className={
              "absolute left-0 top-2 block max-w-[360px] truncate rounded-md bg-white shadow-sm ring-1 ring-black ring-opacity-5 focus:outline-none"
            }
          >
            {props.options.map((option) => {
              const id = props.optionId(option);
              return (
                <Listbox.Option
                  key={id}
                  value={id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-1 pl-6 pr-2 ${
                      active ? "bg-amber-100 text-amber-900" : "text-gray-500"
                    }`
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center space-x-2">
                      {props.optionStyle(option)}
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center text-amber-600">
                          <AiOutlineCheck aria-hidden="true" />
                        </span>
                      ) : null}
                    </div>
                  )}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </div>
      </Transition>
    </Listbox>
  );
}

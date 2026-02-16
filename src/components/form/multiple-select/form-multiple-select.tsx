"use client";

import { Ref, useState, useRef, useEffect, useCallback } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { RiArrowDownSLine } from "@remixicon/react";

export type MultipleSelectInputProps<T extends object> = {
  label: string;
  type?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  testId?: string;
  keyValue: keyof T;
  options: T[];
  renderValue: (option: T[]) => React.ReactNode;
  renderOption: (option: T) => React.ReactNode;
};

function MultipleSelectInput<T extends object>(
  props: MultipleSelectInputProps<T> & {
    name: string;
    value: T[] | undefined | null;
    onChange: (value: T[]) => void;
    onBlur: () => void;
    ref?: Ref<HTMLDivElement | null>;
  }
) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const value = props.value ?? [];
  const valueKeys = value.map((v) => v[props.keyValue]?.toString() ?? "");

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div ref={containerRef} className="relative w-full space-y-2">
      <Label
        htmlFor={`select-${props.name}`}
        className={cn(props.error && "text-error-base")}
      >
        {props.label}
      </Label>
      <button
        ref={props.ref as Ref<HTMLButtonElement>}
        type="button"
        id={`select-${props.name}`}
        onClick={() => {
          if (props.disabled || props.readOnly) return;
          setIsOpen((prev) => !prev);
        }}
        onBlur={props.onBlur}
        disabled={props.disabled}
        data-testid={props.testId}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm ring-offset-bg-white-0",
          "focus:outline-none focus:ring-2 focus:ring-primary-base focus:ring-offset-2",
          props.disabled && "cursor-not-allowed opacity-50",
          props.error && "border-destructive"
        )}
      >
        <span className="truncate">
          {value.length > 0 ? props.renderValue(value) : ""}
        </span>
        <RiArrowDownSLine className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-bg-white-0 p-1 shadow-md">
          {props.options.map((option) => {
            const key = option[props.keyValue]?.toString() ?? "";
            const isSelected = valueKeys.includes(key);
            return (
              <button
                key={key}
                type="button"
                className={cn(
                  "w-full cursor-pointer rounded-sm px-3 py-2 text-left text-sm hover:bg-bg-weak-50 hover:text-text-strong-950",
                  isSelected && "bg-bg-weak-50 text-text-strong-950"
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const newValue = isSelected
                    ? value.filter((v) => v[props.keyValue]?.toString() !== key)
                    : [
                        ...value,
                        props.options.find(
                          (o) => o[props.keyValue]?.toString() === key
                        )!,
                      ];
                  props.onChange(newValue);
                }}
              >
                {props.renderOption(option)}
              </button>
            );
          })}
        </div>
      )}

      {!!props.error && (
        <p
          className="text-sm text-error-base"
          data-testid={`${props.testId}-error`}
        >
          {props.error}
        </p>
      )}
    </div>
  );
}

function FormMultipleSelectInput<
  TFieldValues extends FieldValues = FieldValues,
  T extends object = object,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: MultipleSelectInputProps<T> &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <MultipleSelectInput<T>
          {...field}
          label={props.label}
          autoFocus={props.autoFocus}
          type={props.type}
          error={fieldState.error?.message}
          disabled={props.disabled}
          readOnly={props.readOnly}
          testId={props.testId}
          options={props.options}
          renderOption={props.renderOption}
          renderValue={props.renderValue}
          keyValue={props.keyValue}
        />
      )}
    />
  );
}

export default FormMultipleSelectInput;

"use client";

import { Ref } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type CheckboxInputProps<T> = {
  label: string;
  type?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  testId?: string;
  keyValue: keyof T;
  options: T[];
  keyExtractor: (option: T) => string;
  renderOption: (option: T) => React.ReactNode;
};

function CheckboxInput<T>(
  props: CheckboxInputProps<T> & {
    name: string;
    value: T[] | undefined | null;
    onChange: (value: T[]) => void;
    onBlur: () => void;
    ref?: Ref<HTMLFieldSetElement | null>;
  }
) {
  const value = props.value ?? [];
  const onChange = (checkboxValue: T) => {
    const isExist = value
      .map((option) => option[props.keyValue])
      .includes(checkboxValue[props.keyValue]);

    const newValue = isExist
      ? value.filter(
          (option) => option[props.keyValue] !== checkboxValue[props.keyValue]
        )
      : [...value, checkboxValue];

    props.onChange(newValue);
  };
  return (
    <fieldset data-testid={props.testId} className="space-y-3" ref={props.ref}>
      <legend
        className={cn("text-sm font-medium", props.error && "text-error-base")}
        data-testid={`${props.testId}-label`}
      >
        {props.label}
      </legend>
      <div className="space-y-2">
        {props.options.map((option) => {
          const key = props.keyExtractor(option);
          const checked = value
            .map((valueOption) => valueOption[props.keyValue])
            .includes(option[props.keyValue]);
          return (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={`${props.name}-${key}`}
                checked={checked}
                onCheckedChange={() => onChange(option)}
                name={props.name}
                data-testid={`${props.testId}-${key}`}
              />
              <Label htmlFor={`${props.name}-${key}`} className="font-normal">
                {props.renderOption(option)}
              </Label>
            </div>
          );
        })}
      </div>
      {!!props.error && (
        <p
          className="text-sm text-error-base"
          data-testid={`${props.testId}-error`}
        >
          {props.error}
        </p>
      )}
    </fieldset>
  );
}

function FormCheckboxInput<
  TFieldValues extends FieldValues = FieldValues,
  T = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: CheckboxInputProps<T> &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <CheckboxInput<T>
          {...field}
          label={props.label}
          autoFocus={props.autoFocus}
          type={props.type}
          error={fieldState.error?.message}
          disabled={props.disabled}
          readOnly={props.readOnly}
          testId={props.testId}
          options={props.options}
          keyValue={props.keyValue}
          keyExtractor={props.keyExtractor}
          renderOption={props.renderOption}
        />
      )}
    />
  );
}

export default FormCheckboxInput;

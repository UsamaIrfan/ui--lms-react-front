"use client";

import { Ref, ReactNode } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type RadioInputProps<T> = {
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
  renderOption: (option: T) => ReactNode;
};

function RadioInput<T>(
  props: RadioInputProps<T> & {
    name: string;
    value: T | undefined | null;
    onChange: (value: T) => void;
    onBlur: () => void;
    ref?: Ref<HTMLFieldSetElement | null>;
  }
) {
  const value = props.value;

  return (
    <fieldset data-testid={props.testId} className="space-y-3" ref={props.ref}>
      <legend
        className={cn("text-sm font-medium", props.error && "text-error-base")}
        data-testid={`${props.testId}-label`}
      >
        {props.label}
      </legend>
      <RadioGroup
        value={
          value ? (value[props.keyValue] as string)?.toString() : undefined
        }
        onValueChange={(val) => {
          const selected = props.options.find(
            (option) => (option[props.keyValue] as string)?.toString() === val
          );
          if (selected) props.onChange(selected);
        }}
      >
        {props.options.map((option) => {
          const key = props.keyExtractor(option);
          return (
            <div key={key} className="flex items-center gap-2">
              <RadioGroupItem
                value={(option[props.keyValue] as string)?.toString()}
                id={`${props.name}-${key}`}
                data-testid={`${props.testId}-${key}`}
              />
              <Label htmlFor={`${props.name}-${key}`} className="font-normal">
                {props.renderOption(option)}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
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

function FormRadioInput<
  TFieldValues extends FieldValues = FieldValues,
  T = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: RadioInputProps<T> &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <RadioInput<T>
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

export default FormRadioInput;

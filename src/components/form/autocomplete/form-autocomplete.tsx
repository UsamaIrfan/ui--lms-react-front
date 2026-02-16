"use client";

import { Ref, useState, useRef, useEffect, useCallback } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type AutocompleteInputProps<T> = {
  label: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  testId?: string;
  size?: "small" | "medium";
  value: T | null;
  options: T[];
  renderOption: (option: T) => React.ReactNode;
  getOptionLabel: (option: T) => string;
};

function AutocompleteInput<T>(
  props: AutocompleteInputProps<T> & {
    name: string;
    value: T | undefined | null;
    onChange: (value: T) => void;
    onBlur: () => void;
    ref?: Ref<HTMLDivElement | null>;
  }
) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const filteredOptions = props.options.filter((option) =>
    props.getOptionLabel(option).toLowerCase().includes(search.toLowerCase())
  );

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
        htmlFor={`autocomplete-${props.name}`}
        className={cn(props.error && "text-error-base")}
      >
        {props.label}
      </Label>
      <Input
        ref={props.ref as Ref<HTMLInputElement | null>}
        id={`autocomplete-${props.name}`}
        value={
          isOpen ? search : props.value ? props.getOptionLabel(props.value) : ""
        }
        onChange={(e) => {
          setSearch(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
          setSearch(props.value ? props.getOptionLabel(props.value) : "");
        }}
        onBlur={props.onBlur}
        disabled={props.disabled}
        readOnly={props.readOnly}
        autoFocus={props.autoFocus}
        data-testid={props.testId}
        className={cn(props.error && "border-destructive")}
        autoComplete="off"
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-bg-white-0 p-1 shadow-md">
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              className="cursor-pointer rounded-sm px-3 py-2 text-sm hover:bg-bg-weak-50 hover:text-text-strong-950"
              onMouseDown={(e) => {
                e.preventDefault();
                props.onChange(option);
                setSearch(props.getOptionLabel(option));
                setIsOpen(false);
              }}
            >
              {props.renderOption(option)}
            </li>
          ))}
        </ul>
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

function FormAutocompleteInput<
  TFieldValues extends FieldValues = FieldValues,
  T = unknown,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: AutocompleteInputProps<T> &
    Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue">
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <AutocompleteInput<T>
          {...field}
          label={props.label}
          autoFocus={props.autoFocus}
          error={fieldState.error?.message}
          disabled={props.disabled}
          readOnly={props.readOnly}
          testId={props.testId}
          options={props.options}
          renderOption={props.renderOption}
          getOptionLabel={props.getOptionLabel}
          size={props.size}
          value={props.value}
        />
      )}
    />
  );
}

export default FormAutocompleteInput;

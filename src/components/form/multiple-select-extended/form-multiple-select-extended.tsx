"use client";
import React, { Ref, useState, useRef, useEffect, useCallback } from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { ItemProps, ListProps, Virtuoso } from "react-virtuoso";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type MultipleSelectExtendedInputProps<T extends object> = {
  label: string;
  error?: string;
  testId?: string;
  disabled?: boolean;
  options: T[];
  renderSelected: (option: T[]) => React.ReactNode;
  renderOption: (option: T) => React.ReactNode;
  keyExtractor: (option: T) => string;
  onEndReached?: () => void;
} & (
  | {
      isSearchable: true;
      searchLabel: string;
      searchPlaceholder: string;
      search: string;
      onSearchChange: (search: string) => void;
    }
  | {
      isSearchable?: false;
    }
);

const VirtuosoComponents = {
  List: function VirtuosoList({
    style,
    children,
    ref,
  }: ListProps & { ref?: Ref<HTMLDivElement> }) {
    return (
      <div style={{ padding: 0, ...style, margin: 0 }} role="listbox" ref={ref}>
        {children}
      </div>
    );
  },

  Item: ({ children, ...props }: ItemProps<unknown>) => {
    return (
      <div {...props} style={{ margin: 0 }}>
        {children}
      </div>
    );
  },
};

function MultipleSelectExtendedInput<T extends object>(
  props: MultipleSelectExtendedInputProps<T> & {
    name: string;
    value: T[] | null;
    onChange: (value: T[]) => void;
    onBlur: () => void;
    ref?: Ref<HTMLDivElement | null>;
  }
) {
  const [isOpen, setIsOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const valueKeys = props.value?.map(props.keyExtractor) ?? [];

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

  useEffect(() => {
    if (isOpen) {
      boxRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen]);

  return (
    <div ref={containerRef}>
      <div className="mb-1 space-y-2" ref={boxRef}>
        <Label
          htmlFor={props.name}
          className={cn(props.error && "text-error-base")}
        >
          {props.label}
        </Label>
        <div
          ref={props.ref as Ref<HTMLDivElement>}
          onClick={() => {
            if (props.disabled) return;
            setIsOpen((prev) => !prev);
          }}
          className="cursor-pointer"
        >
          <Input
            name={props.name}
            value={props.value ? String(props.renderSelected(props.value)) : ""}
            onBlur={props.onBlur}
            readOnly
            disabled={props.disabled}
            data-testid={props.testId}
            className={cn(
              "cursor-pointer",
              props.error && "border-destructive"
            )}
          />
        </div>
        {!!props.error && (
          <p
            className="text-sm text-error-base"
            data-testid={`${props.testId}-error`}
          >
            {props.error}
          </p>
        )}
      </div>

      {isOpen && (
        <div className="rounded-md border bg-bg-white-0 shadow-md">
          <div className="p-0">
            {props.isSearchable && (
              <div className="p-3">
                <Input
                  placeholder={props.searchPlaceholder}
                  value={props.search}
                  onChange={(e) => props.onSearchChange?.(e.target.value)}
                  autoFocus
                  data-testid={`${props.testId}-search`}
                />
              </div>
            )}

            <Virtuoso
              style={{
                height:
                  props.options.length <= 6 ? props.options.length * 48 : 320,
              }}
              data={props.options}
              endReached={props.onEndReached}
              components={VirtuosoComponents}
              itemContent={(index, item) => (
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-bg-weak-50 hover:text-text-strong-950",
                    valueKeys.includes(props.keyExtractor(item)) &&
                      "bg-bg-weak-50 text-text-strong-950"
                  )}
                  onClick={() => {
                    const newValue = props.value
                      ? valueKeys.includes(props.keyExtractor(item))
                        ? props.value.filter(
                            (selectedItem) =>
                              props.keyExtractor(selectedItem) !==
                              props.keyExtractor(item)
                          )
                        : [...props.value, item]
                      : [item];
                    props.onChange(newValue);
                  }}
                >
                  {item ? props.renderOption(item) : null}
                </button>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FormMultipleSelectExtendedInput<
  TFieldValues extends FieldValues = FieldValues,
  T extends object = object,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue"> &
    MultipleSelectExtendedInputProps<T>
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <MultipleSelectExtendedInput<T>
          {...field}
          isSearchable={props.isSearchable}
          label={props.label}
          error={fieldState.error?.message}
          disabled={props.disabled}
          testId={props.testId}
          options={props.options}
          renderOption={props.renderOption}
          renderSelected={props.renderSelected}
          keyExtractor={props.keyExtractor}
          search={props.isSearchable ? props.search : ""}
          onSearchChange={
            props.isSearchable ? props.onSearchChange : () => undefined
          }
          onEndReached={props.isSearchable ? props.onEndReached : undefined}
          searchLabel={props.isSearchable ? props.searchLabel : ""}
          searchPlaceholder={props.isSearchable ? props.searchPlaceholder : ""}
        />
      )}
    />
  );
}

export default FormMultipleSelectExtendedInput;

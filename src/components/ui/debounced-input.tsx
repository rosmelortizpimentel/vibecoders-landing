import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface DebouncedInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  value: string;
  onValueChange: (value: string) => void;
  debounceMs?: number;
}

interface DebouncedTextareaProps extends Omit<React.ComponentProps<"textarea">, "onChange"> {
  value: string;
  onValueChange: (value: string) => void;
  debounceMs?: number;
}

/**
 * Input component with local state and debounced updates.
 * Uses focus-gating to prevent cursor jumping: only syncs from props when NOT focused.
 */
export const DebouncedInput = React.forwardRef<HTMLInputElement, DebouncedInputProps>(
  ({ value, onValueChange, debounceMs = 300, className, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(value);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const isFocusedRef = React.useRef(false);

    // Sync local state with prop value ONLY when not focused
    React.useEffect(() => {
      if (!isFocusedRef.current) {
        setLocalValue(value);
      }
    }, [value]);

    // Cleanup timeout on unmount
    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new debounced update
      timeoutRef.current = setTimeout(() => {
        onValueChange(newValue);
      }, debounceMs);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = true;
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = false;
      // Immediately sync on blur
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (localValue !== value) {
        onValueChange(localValue);
      }
      props.onBlur?.(e);
    };

    return (
      <Input
        ref={ref}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(className)}
        {...props}
      />
    );
  }
);
DebouncedInput.displayName = "DebouncedInput";

/**
 * Textarea component with local state and debounced updates.
 * Uses focus-gating to prevent cursor jumping: only syncs from props when NOT focused.
 */
export const DebouncedTextarea = React.forwardRef<HTMLTextAreaElement, DebouncedTextareaProps>(
  ({ value, onValueChange, debounceMs = 300, className, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(value);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const isFocusedRef = React.useRef(false);

    // Sync local state with prop value ONLY when not focused
    React.useEffect(() => {
      if (!isFocusedRef.current) {
        setLocalValue(value);
      }
    }, [value]);

    // Cleanup timeout on unmount
    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new debounced update
      timeoutRef.current = setTimeout(() => {
        onValueChange(newValue);
      }, debounceMs);
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      isFocusedRef.current = true;
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      isFocusedRef.current = false;
      // Immediately sync on blur
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (localValue !== value) {
        onValueChange(localValue);
      }
      props.onBlur?.(e);
    };

    return (
      <Textarea
        ref={ref}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(className)}
        {...props}
      />
    );
  }
);
DebouncedTextarea.displayName = "DebouncedTextarea";

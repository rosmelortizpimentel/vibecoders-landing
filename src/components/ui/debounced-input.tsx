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
 * Prevents cursor jumping issues caused by immediate parent state updates.
 */
export const DebouncedInput = React.forwardRef<HTMLInputElement, DebouncedInputProps>(
  ({ value, onValueChange, debounceMs = 300, className, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(value);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = React.useRef(false);

    // Sync local state with prop value only when not actively typing
    React.useEffect(() => {
      if (!isTypingRef.current) {
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
      isTypingRef.current = true;
      setLocalValue(newValue);

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new debounced update
      timeoutRef.current = setTimeout(() => {
        onValueChange(newValue);
        isTypingRef.current = false;
      }, debounceMs);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Immediately sync on blur
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (localValue !== value) {
        onValueChange(localValue);
      }
      isTypingRef.current = false;
      props.onBlur?.(e);
    };

    return (
      <Input
        ref={ref}
        value={localValue}
        onChange={handleChange}
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
 * Prevents cursor jumping issues caused by immediate parent state updates.
 */
export const DebouncedTextarea = React.forwardRef<HTMLTextAreaElement, DebouncedTextareaProps>(
  ({ value, onValueChange, debounceMs = 300, className, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(value);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = React.useRef(false);

    // Sync local state with prop value only when not actively typing
    React.useEffect(() => {
      if (!isTypingRef.current) {
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
      isTypingRef.current = true;
      setLocalValue(newValue);

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new debounced update
      timeoutRef.current = setTimeout(() => {
        onValueChange(newValue);
        isTypingRef.current = false;
      }, debounceMs);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      // Immediately sync on blur
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (localValue !== value) {
        onValueChange(localValue);
      }
      isTypingRef.current = false;
      props.onBlur?.(e);
    };

    return (
      <Textarea
        ref={ref}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(className)}
        {...props}
      />
    );
  }
);
DebouncedTextarea.displayName = "DebouncedTextarea";

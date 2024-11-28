// components/ProblemText.tsx
import { cn } from "~/lib/utils";
import { type HTMLProps } from "react";

interface ContentBoxProps {
  content: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "emphasis";
  className?: string;
}

export function ContentBox({
  content,
  size = "md",
  variant = "default",
  className,
  ...props
}: ContentBoxProps) {
  const sizeStyles = {
    sm: "text-base leading-relaxed",
    md: "text-lg leading-relaxed",
    lg: "text-xl leading-relaxed",
  };

  const variantStyles = {
    default: "text-slate-700",
    emphasis: "text-slate-900 font-medium",
  };

  return (
    <div
      className={cn(
        "prose max-w-none",
        "mt-4 space-y-4",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
      {...props}
    />
  );
}

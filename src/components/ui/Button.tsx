import { ButtonHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

type Variant = "primary" | "dark" | "ghost" | "secondary" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary: "bg-brand-primary text-white",
  dark: "bg-brand-ink text-white",
  secondary: "bg-brand-primary2 text-brand-ink2",
  ghost: "bg-white text-brand-text border border-brand-border",
  danger: "bg-state-bad text-white",
};

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-pill px-5 py-2.5 text-sm font-semibold shadow-soft transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

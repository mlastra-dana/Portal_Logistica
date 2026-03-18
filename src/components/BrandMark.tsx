import { cn } from "@/components/ui/cn";

type Props = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({ compact = false, className }: Props) {
  return (
    <img
      src="/brand/g3-logistica-logo.svg"
      alt="G3 Logistica"
      className={cn(compact ? "h-10 w-auto object-contain" : "h-14 w-auto object-contain", className)}
    />
  );
}

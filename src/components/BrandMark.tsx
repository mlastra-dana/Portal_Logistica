import { cn } from "@/components/ui/cn";

type Props = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({ compact = false, className }: Props) {
  return (
    <img
      src="/brand/g3-logistica-logo.png?v=2"
      alt="G3 Logistica"
      className={cn(compact ? "h-10 w-auto object-contain object-left" : "h-14 w-auto object-contain object-left", className)}
    />
  );
}

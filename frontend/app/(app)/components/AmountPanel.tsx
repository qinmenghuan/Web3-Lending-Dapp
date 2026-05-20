import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AmountPanel = ({
  label,
  tokenName,
  amount,
  error,
  secondaryText,
  availableText,
  badge,
  onAmountChange,
  onMaxClick,
  active = false,
}: {
  label: string;
  tokenName: string;
  amount: string;
  error?: string;
  secondaryText: string;
  availableText: string;
  badge: string;
  onAmountChange: (value: string) => void;
  onMaxClick: () => void;
  active?: boolean;
}) => {
  return (
    <div
      className={cn(
        "rounded-[28px] border bg-card p-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-colors",
        active
          ? "border-blue-400 shadow-[0_8px_24px_rgba(59,130,246,0.12)]"
          : "border-border",
        error ? "border-red-300" : "",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <p className="text-lg font-medium text-foreground">
          {label} {tokenName}
        </p>
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-500 text-sm font-semibold text-blue-600">
          {badge}
        </span>
      </div>

      <label className="block">
        <span className="sr-only">{label}</span>
        <input
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          inputMode="decimal"
          placeholder="0.00"
          aria-invalid={Boolean(error)}
          className="h-14 w-full border-0 bg-transparent p-0 text-5xl font-light text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />
      </label>

      {/* Available balance */}
      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{secondaryText}</span>
        <div className="flex items-center gap-3">
          <span>{availableText}</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-full px-4 text-muted-foreground"
            onClick={onMaxClick}
          >
            MAX
          </Button>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
    </div>
  );
};

export default AmountPanel;

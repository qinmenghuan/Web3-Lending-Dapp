const SummaryRow = ({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
}) => {
  return (
    <div className="flex items-center justify-between gap-4 text-sm text-foreground">
      <div className="flex items-center gap-2 text-muted-foreground">
        {badge}
        <span>{label}</span>
      </div>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
};

export default SummaryRow;

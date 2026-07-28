import ProductShell from "@/components/layout/ProductShell";

export default function PositionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProductShell>{children}</ProductShell>;
}

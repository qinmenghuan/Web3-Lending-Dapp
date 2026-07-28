import ProductShell from "@/components/layout/ProductShell";

export default function MarketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProductShell>{children}</ProductShell>;
}

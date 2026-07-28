import ProductShell from "@/components/layout/ProductShell";

export default function VaultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProductShell>{children}</ProductShell>;
}

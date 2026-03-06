import ClientLayout from "@/components/ClientLayout";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}

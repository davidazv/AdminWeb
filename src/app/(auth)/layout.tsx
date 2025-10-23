/**
 * Auth Layout - No sidebar for login page
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

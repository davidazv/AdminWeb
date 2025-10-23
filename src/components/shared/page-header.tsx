/**
 * PageHeader - Título grande y subtítulo opcional
 */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-8 space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="text-base text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

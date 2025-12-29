import { cn } from "@/lib/utils";
import { DashboardHeader } from "./dashboard-header";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  title: string;
}

export function PageContainer({ children, className, title }: PageContainerProps) {
  return (
    <div className="min-h-screen">
      <DashboardHeader title={title} />
      <div className={cn("p-6 lg:p-8", className)}>
        {children}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed max-w-xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

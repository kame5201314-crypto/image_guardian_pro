import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("mx-auto max-w-[980px] px-4 lg:px-0 py-16", className)}>
      {children}
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
    <div className="mb-12 flex items-end justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-lg text-[#86868b] leading-relaxed max-w-xl">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

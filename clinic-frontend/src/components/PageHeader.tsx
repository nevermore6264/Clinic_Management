import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
      <div>
        <h1 className="page-title mb-1">{title}</h1>
        {subtitle && <p className="page-subtitle mb-0">{subtitle}</p>}
      </div>
      {children ? <div className="page-header-actions">{children}</div> : null}
    </div>
  );
}

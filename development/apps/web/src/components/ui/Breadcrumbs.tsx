import Link from "next/link";
import React from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav
      className={`flex items-center text-sm text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-hide py-3 ${className}`}
      aria-label="Breadcrumb"
    >
      <Link href="/" className="hover:text-ushop-purple transition-colors truncate">
        Home
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            <span className="mx-2 text-gray-300 shrink-0">›</span>
            {isLast || !item.href ? (
              <span className="text-gray-900 font-medium truncate shrink-0 max-w-[150px] sm:max-w-[250px]">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-ushop-purple transition-colors truncate"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

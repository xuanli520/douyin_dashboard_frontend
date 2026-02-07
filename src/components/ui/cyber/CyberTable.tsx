import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function CyberTable({ children, className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full text-left text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function CyberTableHeader({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("border-b border-slate-200 dark:border-white/10", className)} {...props}>
      {children}
    </thead>
  );
}

export function CyberTableBody({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>{children}</tbody>;
}

export function CyberTableRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-slate-100 dark:border-white/5 transition-all duration-200 group relative",
        "hover:bg-slate-50/80", // Light hover
        "dark:hover:bg-cyan-950/20", // Dark hover base
        className
      )}
      {...props}
    >
      {/* Scanline Effect (Pseudo-element handled via class not easily, so using inset shadow or background gradient on hover via Tailwind utilities in the class above is easier. 
          To do the 'laser scan' described in prompt, we can use a gradient background on hover.
      */}
      {children}
      
      {/* Active Scanline Indicator for Dark Mode */}
      <td className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hidden dark:block shadow-[0_0_10px_#06b6d4]" />
    </tr>
  );
}

export function CyberTableHead({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs",
        "dark:group-hover:text-cyan-200 transition-colors", // Subtle glow interaction
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function CyberTableCell({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "p-4 align-middle text-slate-700 dark:text-slate-300 font-mono", // Monospace for data feeling
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

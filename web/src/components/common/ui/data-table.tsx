import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/utils";

const dataTableVariants = cva("w-full overflow-hidden rounded-2xl border border-border bg-surface border-separate border-spacing-0", {
  variants: {
    layout: {
      auto: "table-auto",
      fixed: "table-fixed",
    },
  },
  defaultVariants: {
    layout: "auto",
  },
});

const dataTableHeaderCellVariants = cva("bg-surface-muted text-center text-xs font-bold text-text-secondary", {
  variants: {
    density: {
      compact: "px-3 py-2",
      comfortable: "px-4 py-2.5",
    },
  },
  defaultVariants: {
    density: "comfortable",
  },
});

const dataTableCellVariants = cva("align-middle text-center", {
  variants: {
    density: {
      compact: "px-3 py-2",
      comfortable: "px-4 py-2.5",
    },
  },
  defaultVariants: {
    density: "comfortable",
  },
});

interface DataTableProps
  extends TableHTMLAttributes<HTMLTableElement>,
    VariantProps<typeof dataTableVariants> {}

export function DataTable({ className, layout, ...props }: DataTableProps) {
  return <table className={cn(dataTableVariants({ layout }), className)} {...props} />;
}

type DataTableHeaderRowProps = HTMLAttributes<HTMLTableRowElement>;

export function DataTableHeaderRow({ className, ...props }: DataTableHeaderRowProps) {
  return <tr className={cn(className)} {...props} />;
}

type DataTableBodyRowProps = HTMLAttributes<HTMLTableRowElement>;

export function DataTableBodyRow({ className, ...props }: DataTableBodyRowProps) {
  return <tr className={cn("border-t border-border", className)} {...props} />;
}

interface DataTableHeaderCellProps
  extends ThHTMLAttributes<HTMLTableCellElement>,
    VariantProps<typeof dataTableHeaderCellVariants> {}

export function DataTableHeaderCell({ className, density, ...props }: DataTableHeaderCellProps) {
  return <th className={cn(dataTableHeaderCellVariants({ density }), className)} {...props} />;
}

interface DataTableCellProps
  extends TdHTMLAttributes<HTMLTableCellElement>,
    VariantProps<typeof dataTableCellVariants> {}

export function DataTableCell({ className, density, ...props }: DataTableCellProps) {
  return <td className={cn(dataTableCellVariants({ density }), className)} {...props} />;
}

interface EmptyTableRowProps
  extends TdHTMLAttributes<HTMLTableCellElement>,
    VariantProps<typeof dataTableCellVariants> {
  colSpan: number;
}

export function EmptyTableRow({
  children,
  className,
  colSpan,
  density,
  ...props
}: EmptyTableRowProps) {
  return (
    <tr className="border-t border-border">
      <td
        colSpan={colSpan}
        className={cn(dataTableCellVariants({ density }), "py-8 text-center text-sm text-text-secondary", className)}
        {...props}
      >
        {children}
      </td>
    </tr>
  );
}

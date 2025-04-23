import React, { ReactNode } from "react";

export interface Column<T> {
  key: keyof T;
  header: string | ReactNode;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  hidden?: (context?: any) => boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  sortConfig?: {
    key: keyof T;
    direction: 'ascending' | 'descending';
  };
  onSort?: (key: keyof T) => void;
  onRowClick?: (item: T) => void;
  rowClassName?: string | ((item: T) => string);
  context?: any;
  className?: string;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  sortConfig,
  onSort,
  onRowClick,
  rowClassName = "",
  context,
  className,
}: TableProps<T>) {
  // Helper for sort direction indicator
  const getSortDirectionIndicator = (key: keyof T) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  // Helper for row classNames
  const getRowClassName = (item: T) => {
    const baseClass = "hover:bg-[#292929] transition-colors";
    const clickableClass = onRowClick ? "cursor-pointer" : "";
    
    const customClass = typeof rowClassName === 'function' 
      ? rowClassName(item) 
      : rowClassName;
    
    return `${baseClass} ${clickableClass} ${customClass}`.trim();
  };

  return (
    <div className={`bg-[#1E1E1E] rounded-lg border border-[#333333] overflow-hidden shadow-lg ${className || ''}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#333333]">
          <thead className="bg-[#252525]">
            <tr>
              {columns.map((column) => {
                if (column.hidden && column.hidden(context)) return null;
                
                return (
                  <th
                    key={String(column.key)}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${column.sortable ? 'cursor-pointer' : ''} ${column.headerClassName || ''}`}
                    onClick={() => column.sortable && onSort && onSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {column.sortable && (
                        <span className="text-gray-500">
                          {getSortDirectionIndicator(column.key)}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333333] bg-[#1E1E1E]">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={getRowClassName(item)}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column) => {
                  if (column.hidden && column.hidden(context)) return null;
                  
                  return (
                    <td
                      key={String(column.key)}
                      className={`px-6 py-4 text-sm text-gray-300 ${column.cellClassName || ''}`}
                    >
                      {column.cell ? column.cell(item) : String(item[column.key] || '')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
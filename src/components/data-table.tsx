import * as React from "react"
import {
   type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
 //type  VisibilityState,
 type  RowSelectionState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
//import  ButtonMain  from "@/components/button-main"
import { ArrowUpDown ,Plus} from "lucide-react"
//import { ButtonGroup,ButtonGroupSeparator } from "@/components/ui/button-group"
//import { motion, AnimatePresence } from "framer-motion"
import ExportExcel from "@/components/ExportExcel"
import { DataTablePagination } from "./table/pagination"
import { DataTableBulkActions } from "@/components/data-table-bulk-actions"
import { role, statuses } from '@/datatypes/datafilter'
import { DataTableToolbar } from "./table/toolbar"
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  actionadd?: () => void
  fileNames?: string
 // handleDelete: (id: string) => void
  //handleView: (id: string) => void
  //handleEdit: (id: string) => void
  handleDeleteSelected: () => void
 // toggleSelect: (id: string) => void
  //selectAll: (ids: string[]) => void
  title?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  fileNames,
  actionadd,
  handleDeleteSelected,
  title
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] =
    React.useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

  })

  //const selectedCount = table.getFilteredSelectedRowModel().rows.length
  //const navigate = useNavigate();

  return (
    <div>
    <div className="space-y-2 relative border rounded-lg bg-card">
       <div className="flex items-center justify-center m-2">
      <h2 className="text-lg font-semibold text-axblue-1 dark:text-white/90">{title}</h2>
      </div>
       <div className="flex flex-wrap items-end justify-end gap-2 m-2">
      <ExportExcel data={data}  fileName={`${fileNames}-${new Date().toISOString().split('T')[0]}`} />
      <Button onClick={actionadd}   className='bg-green-600/10 text-green-600 hover:bg-green-600/20 focus-visible:border-green-600/40 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:hover:bg-green-400/20 dark:focus-visible:border-green-400/40 dark:focus-visible:ring-green-400/40'>
          Ajouter
        <Plus className=" h-4 w-4 " />
      </Button>
      </div>
       <DataTableToolbar
        table={table}
        searchPlaceholder='Filter by name or ID...'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: statuses,
          },
          {
            columnId: 'role',
            title: 'Role',
            options: role,
          }
        ]}
      />
         <DataTableBulkActions table={table} handleDeleteSelected={handleDeleteSelected} />
      <div className=" border-t overflow-hidden">
        <Table>
          <TableHeader className="bg-accent/50" >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <Button
                        variant="ghost"
                        onClick={header.column.getToggleSortingHandler()}
                        className="p-0 h-auto font-semibold text-axblue-1 dark:text-white/90"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                        )}
                      </Button>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="transition-all hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
    <DataTablePagination table={table} className='mt-auto p-4' />
    </div>
  )
}

// components/table/TableBase.tsx
import type { ColumnDef, Row } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Binoculars, MoreHorizontal,SquarePen,Trash2 } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
//import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import type { ColumnConfig, TableRowData } from "@/datatypes/table-types"
import { getRowId } from "@/datatypes/table-types"

type TableBaseProps<T extends TableRowData> = {
  data: T[]
  columnConfigs: ColumnConfig<T>[]   // ✅ configs typées selon T
  title?: string
  fileNames?: string
  actionadd?: () => void
  handleDelete: (id: string) => void
  handleView: (id: string) => void
  handleEdit: (id: string) => void
  handleDeleteSelected: () => void
  toggleSelect: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
}

export function TableBase<T extends TableRowData>({
  data,
  columnConfigs,
  title,
  fileNames,
  actionadd,
  handleDelete,
  handleView,
  handleEdit,
  handleDeleteSelected,
  toggleSelect,
  selectAll,
  clearSelection,
}: TableBaseProps<T>) {

  // ✅ Filtre les colonnes dont hideIfEmpty=true si aucune ligne n'a de valeur
  const visibleColumns = columnConfigs.filter((col) => {
    if (col.hidden) return false
    if (col.hideIfEmpty) {
      return data.some((row) => row[col.key] != null && row[col.key] !== "")
    }
    return true
  })

  const columnDefs: ColumnDef<T>[] = [
    // -- Checkbox de sélection --
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value)
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            value
              ? selectAll(data.map(getRowId))
              : clearSelection()
          }}
        />
      ),
      cell: ({ row }: { row: Row<T> }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value)
            toggleSelect(getRowId(row.original))
          }}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // -- Colonnes dynamiques --
    ...visibleColumns.map((col): ColumnDef<T> => ({
      accessorKey: col.key,
      header: col.header,
      cell: ({ row }: { row: Row<T> }) => {
        const value = row.getValue(col.key)
        // ✅ Utilise le renderer custom ou affiche le texte brut
        return col.render
          ? <>{col.render(value, row.original)}</>
          : <span>{value != null ? String(value) : "—"}</span>
      },
    })),

    // -- Actions --
    {
      id: "actions",
      cell: ({ row }: { row: Row<T> }) => {
        const id = getRowId(row.original)
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(id)}>Détail<DropdownMenuShortcut>
               <Binoculars size={16} /> </DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(id)}>Modifier<DropdownMenuShortcut>
                <SquarePen size={16} />
               </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(id)}>Supprimer <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
          </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
        <DataTable
          columns={columnDefs}
          data={data}
          actionadd={actionadd}
          fileNames={fileNames}
          handleDeleteSelected={handleDeleteSelected}
          title={title}
        />
  )
}
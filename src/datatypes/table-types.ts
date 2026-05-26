// types/table.types.ts
// ✅ Type générique pour une ligne de données
export type TableRowData = Record<string, unknown> & { _id?: string; id?: string }

// ✅ Récupère l'id peu importe le nom du champ (_id ou id)
export function getRowId(row: TableRowData): string {
  return String(row._id ?? row.id ?? "")
}

// ✅ Type d'un renderer de cellule personnalisé
export type CellRenderer<T extends TableRowData = TableRowData> = (
  value: unknown,
  row: T
) => React.ReactNode

// ✅ Définition d'une colonne personnalisée
export type ColumnConfig<T extends TableRowData = TableRowData> = {
  key: string
  header: string
  render?: CellRenderer<T>       // rendu custom optionnel
  hidden?: boolean               // masquer explicitement
  hideIfEmpty?: boolean          // masquer si aucune ligne n'a de valeur
}

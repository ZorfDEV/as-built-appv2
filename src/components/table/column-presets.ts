// components/table/column-presets.ts
// ✅ Colonnes préconfigurées par type de données

import { renderDate, renderRelation, renderRole, renderStatus, renderText } from "./cell-renderers"
import type { ColumnConfig } from "@/datatypes/table-types"
import type { Point, Section, User, marqueur } from "@/datatypes"

// -- Point --
export const POINT_COLUMNS: ColumnConfig<Point>[] = [
  { key: "name",        header: "Nom",         render: renderText },
  { key: "nature",      header: "Nature",      render: renderText },
  { key: "longitude",   header: "Longitude",   render: renderText },
  { key: "latitude",    header: "Latitude",    render: renderText },
  { key: "section_id",  header: "Section",     render: renderRelation("name"), hideIfEmpty: true },
  { key: "status",      header: "Statut",      render: renderStatus,           hideIfEmpty: true },
  { key: "createdAt",   header: "Créé le",     render: renderDate },
]

// -- User --
export const USER_COLUMNS: ColumnConfig<User>[] = [
  { key: "avatar",   header: "Avatar",   render: renderText },
  { key: "name",   header: "Nom",    render: renderText },
  { key: "email",  header: "Email",  render: renderText },
  { key: "role",   header: "Rôle",   render: renderRole,   hideIfEmpty: true },
  { key: "status", header: "Statut", render: renderStatus, hideIfEmpty: true },
  { key: "createdAt",   header: "Créé le",     render: renderDate },
]

// -- Section --
export const SECTION_COLUMNS: ColumnConfig<Section>[] = [
  { key: "name",        header: "Nom",         render: renderText },
  { key: "description", header: "Description", render: renderText },
  { key: "user_id",     header: "Créé par",    render: renderRelation("name"), hideIfEmpty: true },
  { key: "createdAt",   header: "Créé le",     render: renderDate },
]

// -- Marqueur --
export const MARQUEUR_COLUMNS: ColumnConfig<marqueur>[] = [
  { key: "name",      header: "Nom",       render: renderText },
  { key: "file",      header: "Fichier",   render: renderText },
  { key: "createdAt", header: "Créé le",   render: renderDate },
]
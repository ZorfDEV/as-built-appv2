import { useCallback, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FloatingInput } from "@/components/floating-input"
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
} from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button";
//import ButtonMain  from "@/components/button-main"
import {getString } from "@/interfaces/pointInterface"
import {useSections} from "@/hooks/useSections"
import {useMarqueurs} from "@/hooks/useMarqueurs"
import type {  CreatePointData } from '@/datatypes/index';
import { useAuth } from '../../contexts/AuthContext'; 
import { FloatingSelect } from "@/components/floating-select";
import { useNavigate } from "react-router-dom";
import { convertDMSToDecimal } from '@/lib/distance';
import api  from "@/lib/api";
import { AxiosError } from 'axios';
import * as XLSX from 'xlsx'
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from "@/components/ui/separator";
import SectionTitle  from "@/components/section-title";
import {
  MapPinned,
  Tag,
  Globe,
  FileText,
  Layers3,
  CircleDot,
  Grid2X2,
  Star,
  Plus,
  FileSpreadsheet,
  ChevronsLeftRight,
  Info,
  MapPinPen,
} from "lucide-react";
import { Badge } from '@/components/ui/badge';




// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type optionsNature = {
  value: string;
  label: string;
}
type optionsSection = {
  value: string;
  label: string;
}
type optionsMarqueur = {
  value: string;
  label: string;
}
type optionsStatus = {
  value: string;
  label: string;
}

interface RawRow {
  name?: string
  latitude?: string | number
  lat?: string | number
  Latitude?: string | number
  longitude?: string | number
  lng?: string | number
  Longitude?: string | number
  section_id?: string | number
  description?: string
  [key: string]: unknown
}

interface ValidPoint {
  name: string
  latitude: number
  longitude: number
  section_id: string | number | undefined
  description: string
  marqueur_id: string | number | undefined
  status: string
  nature: string
  user_id: string | number | undefined
}

interface RowError {
  row: number
  data: RawRow
  reason: string
}

interface AppProps {
  onPointsUpdated?: () => void
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const PAGE_SIZE = 10

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Returns true if lat/lng are within valid geographic bounds. */
function isValidCoords(lat: number, lng: number): boolean {
  return (
    isFinite(lat) &&
    isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0) // Reject null-island (likely empty field)
  )
}

/** Extracts the raw coordinate value from a row, regardless of column name casing. */
function extractCoord(row: RawRow, keys: (keyof RawRow)[]): string | number | undefined {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== '') return row[key] as string | number
  }
  return undefined
}

/** Attempts to parse coordinates from a row; returns parsed values or an error reason. */
function parseCoords(
  row: RawRow
): { lat: number; lng: number } | { error: string } {
  const rawLat = extractCoord(row, ['latitude', 'lat', 'Latitude'])
  const rawLng = extractCoord(row, ['longitude', 'lng', 'Longitude'])

  // Attempt direct decimal parse
  let lat = Number(rawLat)
  let lng = Number(rawLng)

  if (!isNaN(lat) && !isNaN(lng) && isValidCoords(lat, lng)) {
    return { lat, lng }
  }

  // Fallback: try DMS parsing only if values look like strings
  if (typeof rawLat === 'string' || typeof rawLng === 'string') {
    //const combined = `${rawLat ?? ''} ${rawLng ?? ''}`
    const latitudeconv: number | null = convertDMSToDecimal(rawLat ? String(rawLat) : '')
    const longitudeconv: number | null = convertDMSToDecimal(rawLng ? String(rawLng) : '')
    ///const dms = convertDMS(combined)
    lat = latitudeconv ?? NaN
    lng = longitudeconv ?? NaN

    if (latitudeconv !== null && longitudeconv !== null && isValidCoords(latitudeconv, longitudeconv)) {
      return { lat, lng }
    }
  }

  if (rawLat === undefined || rawLng === undefined) {
    return { error: 'Colonnes latitude/longitude introuvables' }
  }
  if (isNaN(lat) || isNaN(lng)) {
    return { error: `Valeurs non numériques : lat="${rawLat}", lng="${rawLng}"` }
  }
  if (lat === 0 && lng === 0) {
    return { error: 'Coordonnées (0, 0) probablement vides' }
  }
  return { error: `Hors limites géographiques : lat=${lat}, lng=${lng}` }
}

export function AddPoint({ onPointsUpdated }: AppProps) {

  const { user } = useAuth();
  const {sections} = useSections();
  const {marqueurs} = useMarqueurs();
  const navigate = useNavigate();
  const [switcher, setSwitcher] = useState(true);

  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [allRows, setAllRows] = useState<RawRow[]>([])
  const [validRows, setValidRows] = useState<ValidPoint[]>([])
  const [errors, setErrors] = useState<RowError[]>([])
  const [page, setPage] = useState(0)

  const totalPages = Math.ceil(allRows.length / PAGE_SIZE)
  const preview = allRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)


const optionsSections: optionsSection[] = sections.map(section => ({
  value: section._id,
  label: section.name
}));

const optionsMarqueurs: optionsMarqueur[] = marqueurs.map(marqueur => ({
  value: marqueur._id,
  label: marqueur.name
}));

const optionsNatures: optionsNature[] = [
  { value: "pt-asbuilt", label: "Point ASBUILT" },
  { value: "borne-réperage", label: "Borne de réperage" },
  { value: "chambre", label: "Chambre" },
  { value: "incident", label: "Incident" },
];

const optionsStatuses: optionsStatus[] = [
  { value: "active", label: "Actif" },
  { value: "inactive", label: "Inactif" },
  { value: "archived", label: "Terminé" },

];

const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()

  const formData = new FormData(e.target as HTMLFormElement);
  const latDMS = getString(formData, "latitude").trim()
  const lonDMS = getString(formData, "longitude").trim()
 const latitudeconv: number | null = convertDMSToDecimal(latDMS)
 const longitudeconv: number | null = convertDMSToDecimal(lonDMS)
 console.log("DEBUG coords:", { latDMS, lonDMS, latitudeconv, longitudeconv })

    if (
      latitudeconv === null ||
      longitudeconv === null ||
      Number.isNaN(latitudeconv) ||
      Number.isNaN(longitudeconv) ||
      latitudeconv < -90 ||
      latitudeconv > 90 ||
      longitudeconv < -180 ||
      longitudeconv > 180
    ) {
      toast.error("Coordonnées invalides")
      return
    }
    const pointData: CreatePointData = {
      name: getString(formData, "name"),
      longitude: longitudeconv,
      latitude: latitudeconv,
      description: getString(formData, "description"),
      nature: getString(formData, "nature") ,
      section_id: getString(formData, "section_id"),
      marqueur_id: getString(formData, "marqueur_id"),
      user_id: user.id,
      status: getString(formData, "status") 
    }

    console.log('Données du formulaire avant envoi:', pointData);
 try {
     
      const response = await api.post('/points', pointData);
      console.log('Point ajouté avec succès', response.data);
      toast.success('Point ajouté avec succès');
      navigate(-1);
      if (onPointsUpdated) {
        onPointsUpdated();
      }
    } catch {
      //console.log('Erreur ajout point', pointData);
      toast.error("Erreur lors de l'ajout du point");
    }

}

// Logique d'upload de fichier Excel

 const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)

    const reader = new FileReader()

    reader.onerror = () => toast.error('Impossible de lire le fichier.')

    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<RawRow>(sheet)

        if (rows.length === 0) {
          toast.warning('Le fichier est vide ou le format est invalide.')
          return
        }

        const valid: ValidPoint[] = []
        const errs: RowError[] = []

        rows.forEach((row, i) => {
          const result = parseCoords(row)

          if ('error' in result) {
            errs.push({ row: i + 2, data: row, reason: result.error }) // +2: header + 0-index
            return
          }

          valid.push({
            name: String(row.name ?? ''),
            latitude: result.lat,
            longitude: result.lng,
            description: String(row.description ?? ''),
            section_id: row.section_id as string | number | undefined,
            marqueur_id: row.marqueur_id as string | number | undefined,
            status: (row.status as string) || 'inactive',
            nature: (row.nature as string) || 'pt-asbuilt',
            user_id: row.user_id as string | number | undefined,
          })
        })

        console.log('Validation complète', { valid, errs })

        setAllRows(rows)
        setValidRows(valid)
        setErrors(errs)
        setPage(0)

        if (errs.length > 0) {
          toast.warning(`${valid.length} lignes valides, ${errs.length} ligne(s) avec des erreurs.`)
        } else {
          toast.success(`${valid.length} lignes valides — prêt pour l'upload.`)
        }
      } catch {
        toast.error('Erreur lors de la lecture du fichier Excel.')
      }
    }

    reader.readAsBinaryString(selectedFile)
  }, [])

  const handleUpload = async () => {
    if (!file) return toast.error('Sélectionne un fichier Excel')
    if (allRows.length === 0) {
      toast.warning('Sélectionne un fichier avant d\'uploader.')
      return
    }
    if (errors.length > 0) {
      toast.warning(`Corrige les ${errors.length} erreur(s) avant l'upload.`)
      return
    }
 console.log('données envoyées complètes', { validRows, errors })
    try {
      setLoading(true)
      const res = await api.post<{ count: number }>('/points/bulk', validRows)
      toast.success(`Upload réussi : ${res.data.count} points enregistrés.`)

      // Use prop callback instead of global window event
      onPointsUpdated?.()
      navigate(-1)
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>
      const serverMessage = axiosErr.response?.data?.message
      const status = axiosErr.response?.status

      toast.error(serverMessage ? `Erreur serveur (${status}) : ${serverMessage}`
          : `Erreur réseau ou serveur inaccessible.`)
      console.error('[Upload error]', err)
    } finally {
      setLoading(false)
    }
  }
  
  return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className=" flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-400/10">
                <MapPinned className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                 <CardTitle className='text-axblue-2 dark:text-white/80'>Ajouter un point</CardTitle>
                <p className="mt-1 text-sm md:text-base text-slate-400">
                  Renseignez les informations du nouveau point.
                </p>
              </div>
            </div>
      <div className="flex flex-wrap items-end justify-end gap-4">
      <Switch id="airplane-mode" onClick={()=>setSwitcher(!switcher)} />
      <Label htmlFor="airplane-mode">Importer depuis Excel</Label>
       <FileSpreadsheet className="mr-2 h-5 w-5 text-emerald-400" />
         </div>
          </div>
          </CardHeader>
          <CardContent>
              {switcher ? (
          <div className="p-6">
          <Separator className=" mb-4"/>
            <form onSubmit={handleSubmitForm} >
              <div className="relative z-10">
              <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1fr_auto_1fr]">
              {/* LEFT SIDE */}
            <div className="space-y-6">
             <SectionTitle
             icon={<MapPinPen  className="h-4 w-4"/>}
             title="Informations générales"/>

            <FieldGroup >
              <Field>
                <FloatingInput className='dark:focus:border-emerald-400 dark:text-white/70' label="Nom du point" id="name" name="name" required  icon={<Tag className="h-5 w-5 text-emerald-400" />} 
                 labelclassName="peer-focus:bg-white  dark:peer-focus:text-emerald-400 dark:peer-focus:bg-background/80 "/>
              </Field>
               <Field>
                <FloatingInput className='dark:focus:border-emerald-400 dark:text-white/70' label="Latitude" id="latitude" name="latitude" type="text" required  icon={<Globe className="h-5 w-5 text-emerald-400" />}  labelclassName="peer-focus:bg-white  dark:peer-focus:text-emerald-400 dark:peer-focus:bg-background/80 "/>
              </Field>
              <Field>
                <FloatingInput className='dark:focus:border-emerald-400 dark:text-white/70' label="Longitude" id="longitude" name="longitude" type="text" required  icon={<Globe className="h-5 w-5 text-emerald-400" />}  labelclassName="peer-focus:bg-white  dark:peer-focus:text-emerald-400 dark:peer-focus:bg-background/80 "/>
              </Field>
              <Field>
                <FloatingInput className='dark:focus:border-emerald-400 dark:text-white/70' label="Description" id="description" name="description" type="textarea" required  icon={<FileText className="h-5 w-5 text-emerald-400" />}  labelclassName="peer-focus:bg-white  dark:peer-focus:text-emerald-400 dark:peer-focus:bg-background/80 "/>
              </Field>
            </FieldGroup>
            </div>
             {/* Divider desktop */}
        <div className="hidden xl:flex items-center justify-center">
           <div className="h-full w-px bg-border shrink-0 relative">
               <Button variant="outline" className=" absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full  flex items-center justify-center ">
                  <ChevronsLeftRight className="h-4 w-4 " />
                            </Button>
                          </div>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="space-y-6">
                          <SectionTitle
                            icon={<Layers3 className="h-4 w-4" />}
                            title="Classification"
                          />
              <FieldGroup>
                <Field>
                <FloatingSelect label="Nature" id="nature" name="nature" required options={optionsNatures} defaultValue=""        
                 onValueChange={(val) => console.log(val)} icon={<Tag className="h-5 w-5 text-emerald-400" />} />
              </Field>
              <Field>
                <FloatingSelect label="Statut" id="status" name="status" required options={optionsStatuses} defaultValue=""        
                onValueChange={(val) => console.log(val)}  icon={<CircleDot className="h-4 w-4 text-emerald-400" />} />
              </Field>
              <Field>
                <FloatingSelect label="Section" id="section_id" name="section_id" required options={optionsSections}  icon={<Grid2X2 className="h-4 w-4 text-emerald-400" />} />
              </Field>
              <Field>
                <FloatingSelect label="Marqueur" id="marqueur_id" name="marqueur_id" required options={optionsMarqueurs}  icon={<Star className="h-5 w-5 text-emerald-400" />} />
              </Field>
              </FieldGroup>
               {/* Info card */}
              <div className=" flex flex-col-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 ">
               <Badge className="rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                <Info className='h-4 w-4' />
               </Badge>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Tous les champs sont obligatoires.
                </p>
              </div>
           </div>
           </div>
             {/* Footer actions */}
            <Separator className="my-8" />
           <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
               <Field className='w-40 sm:w-auto'>
                <Button variant="outline" onClick={() => navigate(-1)} className='w-auto' >
                  Annuler
                </Button>
              </Field>
              <Field className='w-40 sm:w-auto'>
               <Button className='bg-green-600/10  text-green-600 hover:bg-green-600/20 focus-visible:border-green-600/40 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:hover:bg-green-400/20 dark:focus-visible:border-green-400/40 dark:focus-visible:ring-green-400/40' type="submit">
              <Plus className="mr-2 h-5 w-5" />
              Ajouter le point
            </Button>
              </Field>
            </div>
            </div>
              </form>
          </div>
        ) : (
            <div className="flex flex-col items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 w-1/2 mb-6">
        <FieldGroup >
        <Field>
        <Input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
         </Field>
        </FieldGroup>
        <div className='flex justify-end space-x-2' >
        <Button variant="ghost" onClick={() => navigate(-1)} >
          Annuler
        </Button>
        <Button onClick={handleUpload} disabled={loading} >
          {loading ? 'Upload...' : 'Uploader'}
        </Button>

        </div>
        </div>
         {/* Progress bar */}
      {loading && (
        <div style={{ marginTop: 10 }}>
          <div style={{ width: '100%', background: '#eee' }}>
            <Spinner />
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{ color: 'red', marginTop: 20 }}>
          <h3>Erreurs détectées</h3>
          <ul>
            {errors.map((e, i) => (
              <li key={i}>Ligne {e.row}: {e.reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div>
          <div className="mt-8">
          <h4 className="font-semibold mb-2">Aperçu du fichier :(page {page + 1})</h4>
          <div className="overflow-x-auto mb-4">
            <table className="table-auto border w-full text-sm">
            <thead>
              <tr className="bg-gray-200">
               {Object.keys(preview[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="border px-2 py-1">{String(val)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
           {/* Pagination controls */}
          <div style={{ marginTop: 10 }}>
            <button onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0}>
              Précédent
            </button>
             <span style={{ color: '#6b7280' }}>
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => (p + 1) * PAGE_SIZE < allRows.length ? p + 1 : p)}
              disabled={(page + 1) * PAGE_SIZE >= allRows.length}
              style={{ marginLeft: 10 }}
            >
              Suivant
            </button>
          </div>
        </div>
         </div>
         <div>
          <h4 className="font-semibold mb-2">Visualisation sur la carte :</h4>
          {validRows.length > 0 ? (
            <MapContainer center={[validRows[0].latitude, validRows[0].longitude]} zoom={12} style={{ height: '400px', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {validRows.map((p, i) => (
                <Marker key={i} position={[p.latitude as number, p.longitude as number]}>
                  <Popup>{p.description}</Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <p>Impossible de charger la carte avec les coordonnées actuelles.</p>
          )}
          </div>
       </div>
      )}
    
          </div>
        )}
          </CardContent>
        </Card>
      </div>
  )
}

// File: src/App.tsx
import { useState } from 'react'
import axios from 'axios'
import * as XLSX from 'xlsx'

const PAGE_SIZE = 10

function isValidLatLng(lat: any, lng: any): boolean {
  const latNum = Number(lat)
  const lngNum = Number(lng)
  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return false
  return latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [allRows, setAllRows] = useState<any[]>([])
  const [page, setPage] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  const preview = allRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const selectedFile = e.target.files[0]
    setFile(selectedFile)

    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = evt.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(sheet)

      setAllRows(json)
      setPage(0)

      // Validation
      const errs: string[] = []
      json.forEach((row: any, idx: number) => {
        const lat = row.lat || row.latitude
        const lng = row.lng || row.longitude

        if (!isValidLatLng(lat, lng)) {
          errs.push(`Ligne ${idx + 1}: coordonnées invalides (${lat}, ${lng})`)
        }
      })

      setErrors(errs)
    }
    reader.readAsBinaryString(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return alert('Sélectionne un fichier Excel')
    if (errors.length > 0) return alert('Corrige les erreurs avant upload')

    const formData = new FormData()
    formData.append('file', file)

    try {
      setLoading(true)
      setProgress(0)

      const res = await axios.post('/api/points/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (!event.total) return
          const percent = Math.round((event.loaded * 100) / event.total)
          setProgress(percent)
        }
      })

      alert(`Upload réussi: ${res.data.count} points ajoutés`)
      window.dispatchEvent(new Event('points-updated'))

    } catch (error) {
      console.error(error)
      alert("Erreur lors de l'upload")
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload fichier Excel</h2>

      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Upload...' : 'Uploader'}
      </button>

      {/* Progress bar */}
      {loading && (
        <div style={{ marginTop: 10 }}>
          <div style={{ width: '100%', background: '#eee' }}>
            <div style={{ width: `${progress}%`, background: 'green', color: 'white', textAlign: 'center' }}>
              {progress}%
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{ color: 'red', marginTop: 20 }}>
          <h3>Erreurs détectées</h3>
          <ul>
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview paginée */}
      {preview.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Preview (page {page + 1})</h3>

          <table border={1} cellPadding={5}>
            <thead>
              <tr>
                {Object.keys(preview[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j}>{String(val)}</td>
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

            <button
              onClick={() => setPage(p => (p + 1) * PAGE_SIZE < allRows.length ? p + 1 : p)}
              disabled={(page + 1) * PAGE_SIZE >= allRows.length}
              style={{ marginLeft: 10 }}
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

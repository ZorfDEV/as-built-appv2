
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button"
import { CloudUpload} from "lucide-react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ExportExcel = ({ data, fileName,}: { data: any[], fileName?: string }) => {
  const exportToExcel = () => {
    try {
      // Création d'un nouveau classeur
      const workbook = XLSX.utils.book_new();
      
      // Conversion des données en feuille de calcul
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Ajout de la feuille au classeur
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Données');
      
      // Génération du fichier Excel
      XLSX.writeFile(workbook, `${fileName || 'export'}.xlsx`);
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
    }
  };

  return (
      <Button onClick={exportToExcel} variant="outline"  className=' border-dashed border-sky-600 text-sky-600! hover:bg-sky-600/10 focus-visible:border-sky-600 focus-visible:ring-sky-600/20 dark:border-sky-400 dark:text-sky-400! dark:hover:bg-sky-400/10 dark:focus-visible:border-sky-400 dark:focus-visible:ring-sky-400/40'
  >
          Exporter
        <CloudUpload  className="h-4 w-4" />
      </Button>
   
  );
};


export default ExportExcel;
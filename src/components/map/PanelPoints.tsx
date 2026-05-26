import { useState } from 'react'
import type { Point } from '@/datatypes/index';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function PanelPoints({listpoints}: {listpoints: Point[]}) {

     const [visible] = useState(true);

  return (
     <>
       {/* Liste des points proches */}
       {listpoints.length > 0 && visible && (
            <div className="absolute top-14 left-1/4 -translate-x-1/2 z-2200 flex gap-2 items-center w-92">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Points proches</CardTitle>
                  <CardDescription className="text-xs">
                    Liste des points plus proches à moins de 5 km
                  </CardDescription>
                </CardHeader>
                <CardContent>
              <Table>
                <TableHeader>
                <TableRow>
             <TableHead className="w-25">Nom</TableHead>
             <TableHead className="text-right">Distance (km)</TableHead>
              </TableRow>
              </TableHeader>
                 <TableBody>
                  {listpoints.map((p, index) => (
                     <TableRow key={p._id.toString() + index.toString()}>
                        <TableCell className="flex justify-center items-center m-2 text-gray-500 dark:text-darktext-secondary">
                          {p.name} <span className='p-2 font-semibold text-gray-800'>({p.distance} km)</span> 
                        </TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
                </Table>
                </CardContent>
              </Card>
            </div>
       )}
     </>
  )
}

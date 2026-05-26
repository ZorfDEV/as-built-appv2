import {useSections} from "@/hooks/useSections"
import {useMarqueurs} from "@/hooks/useMarqueurs"
import type {  CreatePointData } from '@/datatypes/index';
import { FloatingInput } from "@/components/floating-input"
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
import { Button } from "@/components/ui/button";
import { FloatingSelect } from "@/components/floating-select";
import { useNavigate } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown } from "lucide-react"
import React from "react";

type optionsSection = {
  value: string;
  label: string;
}
type optionsMarqueur = {
  value: string;
  label: string;
}


function PointForm({handleSubmitForm , title, data}: {handleSubmitForm: (e: React.FormEvent<HTMLFormElement>) => void;  title: string; data:CreatePointData}) {

    const navigate = useNavigate();
     const {sections} = useSections();
     const {marqueurs} = useMarqueurs();

  const optionsSections: optionsSection[] = sections.map(section => ({
  value: section._id,
  label: section.name
}));

const optionsMarqueurs: optionsMarqueur[] = marqueurs.map(marqueur => ({
  value: marqueur._id,
  label: marqueur.name
}));

const [isOpen, setIsOpen] = React.useState(false)
    
  return (
    <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="p-6">
            <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex w-87.5 flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-4 px-4">
        <h4 className="text-sm font-semibold">Details</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <ChevronsUpDown />
            <span className="sr-only">Toggle details</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="flex items-center justify-between rounded-md border px-4 py-2 text-sm">
        <span className="text-muted-foreground">Nom:</span>
        <span className="font-medium">{data.name}</span>
      </div>
      <CollapsibleContent className="flex flex-col gap-2">
      <div className="grid grid-cols-2">
      <div className="px-4 py-2 text-sm">
        <div className="rounded-md border px-4 py-2 text-sm mb-2">
          <p className="font-medium">Longitude</p>
          <p className="text-muted-foreground">{data.longitude}</p>
        </div>
        <div className="rounded-md border px-4 py-2 text-sm">
          <p className="font-medium">Latitude</p>
          <p className="text-muted-foreground">{data.latitude}</p>
        </div>
        </div>
         <div className=" px-4 py-2 text-sm">
        <div className="rounded-md border px-4 py-2 mb-2 text-sm">
          <p className="font-medium">Statut</p>
          <p className="text-muted-foreground">{data.status}</p>
        </div>
        <div className="rounded-md border px-4 py-2 text-sm">
          <p className="font-medium">Nature</p>
          <p className="text-muted-foreground">{data.nature}</p>
        </div>
        </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
    </div>
          <div className="p-6 mt-2 border-t">
            <form onSubmit={handleSubmitForm}>
            <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
             
            <FieldGroup >
              <Field>
                <FloatingInput label="Nom du point" id="name" name="name" required defaultValue={data.name} />
              </Field>
              <Field>
                <FloatingInput label="Longitude" id="longitude" name="longitude" type="text" required defaultValue={data.longitude ||''}/>
              </Field>
              <Field>
                <FloatingInput label="Latitude" id="latitude" name="latitude" type="text" required defaultValue={data.latitude ||''} />
              </Field>
              <Field>
                <FloatingInput label="Description" id="description" name="description" type="textarea" required defaultValue={data.description} />
              </Field>
            </FieldGroup>
            
              <div className=" separator-v ml-30 h-auto w-0 border border-gray-200 dark:border-darkborder"></div>
              
              <FieldGroup>
                <Field>
                <FloatingSelect label="Nature" id="nature" name="nature" required options={[{ value: 'pt-asbuilt', label: 'As Built'}, { value: 'incident', label: 'Incident' },{ value: 'chambre', label: 'Chambre' },{ value: 'borne-réperage', label: 'Borne de réperage' }]} />
              </Field>
              <Field>
                <FloatingSelect label="Statut" id="status" name="status" required options={[{ value: 'active', label: 'Actif' }, { value: 'inactive', label: 'Inactif' }]} />
              </Field>
              <Field>
                <FloatingSelect label="Section" id="section_id" name="section_id" required options={optionsSections} />
              </Field>
              <Field>
                <FloatingSelect label="Marqueur" id="marqueur_id" name="marqueur_id" required options={optionsMarqueurs} />
              </Field>
              </FieldGroup>
             <Field>
                <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4" label="Annuler"></Button>
              </Field>
              <div></div>
              <Field>
                <Button type="submit" className="mt-4" label="Ajouter"></Button>
              </Field>
            </div>
              </form>
          </div>
          </CardContent>
        </Card>
      </div>
  )
}

export default PointForm
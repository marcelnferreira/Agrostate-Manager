import { useRoute } from "wouter";
import PropertyForm from "@/components/property-form";
import { api } from "@/lib/mock-data";

export default function PropertyEditorPage() {
  const [match, params] = useRoute("/dashboard/properties/:id");
  const isEdit = match && params?.id !== "new";
  
  const property = isEdit ? api.getProperty(params!.id) : undefined;

  if (isEdit && !property) {
    return <div className="p-8">Propriedade não encontrada.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PropertyForm mode={isEdit ? 'edit' : 'create'} initialData={property} />
    </div>
  );
}

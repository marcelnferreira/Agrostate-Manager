import { useRoute } from "wouter";
import PropertyForm from "@/components/property-form";
import { propertiesApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function PropertyEditorPage() {
  const [match, params] = useRoute("/dashboard/properties/:id");
  const isEdit = match && params?.id !== "new";
  
  const { data: property, isLoading } = useQuery({
    queryKey: ['property', params?.id],
    queryFn: () => propertiesApi.getById(params!.id),
    enabled: isEdit && !!params?.id,
  });

  if (isEdit && !property && !isLoading) {
    return <div className="p-8">Propriedade não encontrada.</div>;
  }

  if (isEdit && isLoading) {
    return <div className="p-8">A carregar...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PropertyForm mode={isEdit ? 'edit' : 'create'} initialData={property} />
    </div>
  );
}

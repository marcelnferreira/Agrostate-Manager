import { useRoute } from "wouter";
import PropertyForm from "@/components/property-form";
import { propertiesApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function PropertyEditorPage() {
  const [match, params] = useRoute("/dashboard/properties/:id");
  const [adminMatch, adminParams] = useRoute("/admin/properties/:id");
  const routeMatch = match || adminMatch;
  const routeParams = params || adminParams;
  const isEdit = routeMatch && routeParams?.id !== "new";
  
  const { data: property, isLoading } = useQuery({
    queryKey: ['property', routeParams?.id],
    queryFn: () => propertiesApi.getById(routeParams!.id),
    enabled: isEdit && !!routeParams?.id,
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

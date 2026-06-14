import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { propertiesApi, usersApi, uploadApi } from "@/lib/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import type { Property } from "@shared/schema";

const basePropertySchema = z.object({
  title: z.string().min(5, "Título muito curto"),
  description: z.string().min(20, "Descrição muito curta"),
  location: z.string().min(2, "Localização obrigatória"),
  areaHa: z.coerce.number().min(0.01, "Área inválida"),
  price: z.coerce.number().min(100, "Preço inválido"),
  mediationType: z.enum(["EXCLUSIVE", "OPEN"]),
  socialLinks: z.array(z.object({
    platform: z.enum(['WEBSITE', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE']),
    url: z.string().url("URL inválido")
  }))
});

const propertySchema = basePropertySchema;
const propertySchemaWithMediator = basePropertySchema.extend({
  ownerMediatorId: z.string().min(1, "Selecione um mediador")
});

type PropertyFormValues = z.infer<typeof basePropertySchema> & {
  ownerMediatorId?: string;
};

interface PropertyFormProps {
  initialData?: Property;
  mode: 'create' | 'edit';
}

export default function PropertyForm({ initialData, mode }: PropertyFormProps) {
  // AI_GENERATED_CODE_START
  // Descrição: Adicionar suporte para seleção de mediador quando admin cria novo anúncio
  // Gerado por: Cursor AI
  // Versão: React 18.2.0, TypeScript 4.9.5
  // AI_GENERATED_CODE_END
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === 'ADMIN';
  const isAdminCreating = isAdmin && mode === 'create';
  const backLink = isAdmin ? "/admin/properties" : "/dashboard/properties";

  // Buscar lista de usuários quando for admin criando novo anúncio
  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
    enabled: isAdminCreating,
  });

  // Filtrar apenas mediadores ativos
  const mediators = allUsers.filter(u => u.role === 'MEDIATOR' && u.status === 'ACTIVE');

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(isAdminCreating ? propertySchemaWithMediator : propertySchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      areaHa: initialData?.areaHa || 0,
      price: initialData?.price || 0,
      mediationType: initialData?.mediationType || "OPEN",
      socialLinks: initialData?.socialLinks || [],
      ...(isAdminCreating && { ownerMediatorId: user?.id || "" })
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  const createPropertyMutation = useMutation({
    mutationFn: propertiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: "Anúncio criado",
        description: "As alterações foram guardadas com sucesso."
      });
      setLocation(backLink);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível criar o anúncio."
      });
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PropertyFormValues> }) => 
      propertiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property'] });
      toast({
        title: "Anúncio atualizado",
        description: "As alterações foram guardadas com sucesso."
      });
      setLocation(backLink);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível atualizar o anúncio."
      });
    },
  });

  const onSubmit = async (data: PropertyFormValues) => {
    // AI_GENERATED_CODE_START
    // Descrição: Garantir que images seja sempre um array válido ao enviar
    // Gerado por: Cursor AI
    // Versão: React 18.2.0, TypeScript 4.9.5
    // AI_GENERATED_CODE_END
    
    const propertyData: any = { 
      ...data, 
      images: Array.isArray(images) ? images : [],
      socialLinks: JSON.stringify(data.socialLinks)
    };
    
    // Se for admin criando novo anúncio, incluir ownerMediatorId
    if (isAdminCreating && 'ownerMediatorId' in data) {
      propertyData.ownerMediatorId = data.ownerMediatorId;
    }
    
    if (mode === 'create') {
      createPropertyMutation.mutate(propertyData);
    } else if (initialData?.id) {
      updatePropertyMutation.mutate({ id: initialData.id, data: propertyData });
    }
  };

  // AI_GENERATED_CODE_START
  // Descrição: Implementação de upload de imagens reais
  // Gerado por: Cursor AI
  // Versão: React 18.2.0, TypeScript 4.9.5
  // AI_GENERATED_CODE_END
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Formato inválido",
        description: "Apenas imagens são permitidas (JPG, PNG, GIF, WEBP)",
      });
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB",
      });
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadApi.uploadImage(file);
      setImages([...images, imageUrl]);
      toast({
        title: "Imagem carregada",
        description: "A imagem foi carregada com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar",
        description: error.message || "Não foi possível carregar a imagem.",
      });
    } finally {
      setIsUploading(false);
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto pb-20">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif font-bold">
            {mode === 'create' ? 'Novo Anúncio' : 'Editar Anúncio'}
          </h1>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setLocation(backLink)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending}>
              {(createPropertyMutation.isPending || updatePropertyMutation.isPending) ? "A guardar..." : "Guardar Anúncio"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informação Principal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Anúncio</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Herdade no Douro Superior" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Detalhada</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva a propriedade, culturas, infraestruturas..." 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (€)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="areaHa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área (hectares)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localização</FormLabel>
                        <FormControl>
                          <Input placeholder="Concelho, Distrito" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mediationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Mediação</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EXCLUSIVE">Exclusivo</SelectItem>
                            <SelectItem value="OPEN">Aberto / Parceria</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isAdminCreating && (
                  <FormField
                    control={form.control}
                    name="ownerMediatorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mediador Principal</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o mediador" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {user && (
                              <SelectItem value={user.id}>
                                {user.fullName} (Eu)
                              </SelectItem>
                            )}
                            {mediators.map((mediator) => (
                              <SelectItem key={mediator.id} value={mediator.id}>
                                {mediator.fullName} - {mediator.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <FormField
                      control={form.control}
                      name={`socialLinks.${index}.platform`}
                      render={({ field }) => (
                        <FormItem className="w-[140px]">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Plataforma" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="WEBSITE">Website</SelectItem>
                              <SelectItem value="FACEBOOK">Facebook</SelectItem>
                              <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                              <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                              <SelectItem value="YOUTUBE">YouTube</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`socialLinks.${index}.url`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => append({ platform: 'WEBSITE', url: '' })}
                >
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Link
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Galeria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square group rounded-md overflow-hidden bg-muted">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={isUploading}
                    className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-md hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-6 h-6 mb-1 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">A carregar...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-xs">Carregar</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos suportados: JPG, PNG. Max 5MB.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 18 18"/>
    </svg>
  )
}

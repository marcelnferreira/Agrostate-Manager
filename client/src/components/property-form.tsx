import { useState } from "react";
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
import { Property, api } from "@/lib/mock-data";

const propertySchema = z.object({
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

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  initialData?: Property;
  mode: 'create' | 'edit';
}

export default function PropertyForm({ initialData, mode }: PropertyFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      areaHa: initialData?.areaHa || 0,
      price: initialData?.price || 0,
      mediationType: initialData?.mediationType || "OPEN",
      socialLinks: initialData?.socialLinks || []
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  const onSubmit = async (data: PropertyFormValues) => {
    // In a real app, we would send this to the API
    console.log("Submitting:", { ...data, images });
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));

    toast({
      title: mode === 'create' ? "Anúncio criado" : "Anúncio atualizado",
      description: "As alterações foram guardadas com sucesso."
    });

    setLocation("/dashboard/properties");
  };

  const handleImageUpload = () => {
    // Mock image upload
    const mockImages = [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ];
    setImages([...images, mockImages[Math.floor(Math.random() * mockImages.length)]]);
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
            <Button type="button" variant="outline" onClick={() => setLocation("/dashboard/properties")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "A guardar..." : "Guardar Anúncio"}
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
                    className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-md hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground"
                  >
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs">Carregar</span>
                  </button>
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

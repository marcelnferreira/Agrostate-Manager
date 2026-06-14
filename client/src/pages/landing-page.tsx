import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { propertiesApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import type { Property } from "@shared/schema";
import heroImg from "@assets/generated_images/aerial_view_of_agricultural_land_and_farms.png";
import logoImg from "@assets/generated_images/minimalist_logo_icon_for_agrostate.png";
import { MapPin, ArrowRight } from "lucide-react";

export default function LandingPage() {
  // AI_GENERATED_CODE_START
  // Descrição: Buscar top 3 propriedades em destaque para exibição na landing page
  // Gerado por: Cursor AI
  // Versão: React Query, TanStack Query
  // AI_GENERATED_CODE_END
  const { user } = useAuth();
  const { data: featuredProperties = [] } = useQuery<Property[]>({
    queryKey: ['properties', 'featured'],
    queryFn: () => propertiesApi.getFeatured(),
    enabled: true,
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Agrostate" className="w-8 h-8" />
            <span className="font-serif text-xl font-bold text-primary">Agrostate</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/auth">
              <Button>Criar Conta</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[300px] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src={heroImg} 
          alt="Alentejo Landscape" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center max-w-3xl px-4 space-y-6">
          <h1 className="text-5xl md:text-6xl font-serif font-bold drop-shadow-lg">
            A sua terra, o nosso compromisso.
          </h1>
          <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">
            Somos um social marketplace focado em imóveis rústicos.
          </p>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold text-primary mb-2">Destaques</h2>
              <p className="text-muted-foreground">Oportunidades únicas selecionadas para si.</p>
            </div>
            <Link href="/auth">
              <Button variant="outline" className="hidden md:flex">Ver Todas</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property: Property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow border-none shadow-md group">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img 
                    src={property.images[0]} 
                    alt={property.title} 
                    className="w-full h-full object-cover transition-transform duration-100 group-hover:scale-105"
                  />
                  <Badge className="absolute top-4 right-4 bg-white text-primary hover:bg-white/90">
                    {property.mediationType === 'EXCLUSIVE' ? 'Exclusivo' : 'Oportunidade'}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif font-bold text-xl">{property.title}</h3>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm gap-1">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {property.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                    <div>
                      <span className="block text-xs text-muted-foreground uppercase">Área</span>
                      {property.areaHa} ha
                    </div>
                    <div className="text-right">
                      <span className="block text-xs text-muted-foreground uppercase">Preço</span>
                      {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(property.price)}
                    </div>
                  </div>
                </CardContent>
                {user && (
                  <CardFooter className="pt-0">
                    <Link href={`/properties/${property.id}`}>
                      <Button className="w-full variant-secondary group-hover:bg-primary group-hover:text-white transition-colors">
                        Ver Detalhes <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 mt-auto">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="Agrostate" className="w-8 h-8 bg-white rounded-full p-1" />
              <span className="font-serif text-xl font-bold">Agrostate</span>
            </div>
            <p className="text-sm opacity-80">
              Mediação imobiliária especializada no setor agrícola.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Plataforma</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link href="/auth">Entrar</Link></li>
              <li><Link href="/auth">Criar Conta</Link></li>
              <li><a href="#">Propriedades</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#">Termos e Condições</a></li>
              <li><a href="#">Política de Privacidade</a></li>
              <li><a href="#">Acordo de Mediação</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>admin@agrostate.com</li>
              <li>+351 968 940 258</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

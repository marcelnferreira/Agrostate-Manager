import { useAuth, api } from "@/lib/mock-data";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter, Eye, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { LeadDialog } from "@/components/lead-dialog";

export default function ExternalPropertiesPage() {
  const { user } = useAuth();
  
  if (!user) return <div>Acesso negado</div>;

  // Filter properties that do NOT belong to the current user
  const properties = api.getProperties().filter(p => p.ownerMediatorId !== user.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold">Anúncios Externos</h1>
          <p className="text-muted-foreground">Explorar propriedades de outros mediadores.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Procurar referência, título..." className="pl-9" />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            Não existem propriedades externas disponíveis.
          </div>
        ) : (
          properties.map((property) => (
            <Card key={property.id} className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-muted">
                <img 
                  src={property.images[0]} 
                  alt={property.title} 
                  className="w-full h-full object-cover"
                />
                <Badge 
                  className={`absolute top-2 right-2 ${
                    property.mediationType === 'EXCLUSIVE' 
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {property.mediationType === 'EXCLUSIVE' ? 'Exclusivo' : 'Aberto'}
                </Badge>
              </div>
              
              <CardHeader className="p-4 pb-2">
                <div className="text-xs font-mono text-muted-foreground mb-1">{property.referenceId}</div>
                <h3 className="font-bold text-lg line-clamp-1" title={property.title}>{property.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  {property.location}
                </p>
              </CardHeader>
              
              <CardContent className="p-4 pt-0 flex-1">
                <div className="flex justify-between items-end mt-2">
                  <div className="font-bold text-xl text-primary">
                    {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price)}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {property.areaHa} ha
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 bg-muted/50 flex gap-2">
                <Link href={`/properties/${property.id}`} className="flex-1">
                  <Button variant="outline" className="w-full gap-2" size="sm">
                    <Eye className="w-4 h-4" /> Detalhes
                  </Button>
                </Link>
                
                <LeadDialog 
                  propertyId={property.id}
                  trigger={
                    <Button className="flex-1 gap-2" size="sm">
                      <UserPlus className="w-4 h-4" /> Lead
                    </Button>
                  }
                />
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

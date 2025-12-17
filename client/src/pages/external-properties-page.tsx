import { useAuth, api } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Eye, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referência</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Mediador Responsável</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Área (ha)</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Não existem propriedades externas disponíveis.
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property) => {
                  const mediator = api.getUser(property.ownerMediatorId);
                  return (
                    <TableRow key={property.id}>
                      <TableCell className="font-mono text-xs">{property.referenceId}</TableCell>
                      <TableCell className="font-medium">{property.title}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{mediator?.fullName || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">{mediator?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{property.location}</TableCell>
                      <TableCell>{property.areaHa} ha</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/properties/${property.id}`}>
                            <Button variant="ghost" size="icon" title="Ver Detalhes">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="text-primary hover:text-primary" title="Contactar Mediador">
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

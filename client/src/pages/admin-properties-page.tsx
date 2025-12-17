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
import { Search, Filter, Eye, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function AdminPropertiesPage() {
  const { user } = useAuth();
  
  if (!user || user.role !== 'ADMIN') return <div>Acesso negado</div>;

  const properties = api.getProperties();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold">Gestão de Anúncios</h1>
          <p className="text-muted-foreground">Visualização global de todas as propriedades.</p>
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
                <TableHead>Mediador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Não existem propriedades registadas.
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
                        <span className="text-sm text-muted-foreground">
                          {mediator?.fullName || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={property.mediationType === 'EXCLUSIVE' ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-blue-200 bg-blue-50 text-blue-700'}>
                          {property.mediationType === 'EXCLUSIVE' ? 'Exclusivo' : 'Aberto'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price)}
                      </TableCell>
                      <TableCell>
                         <Badge variant="secondary" className={property.status === 'ACTIVE' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-700'}>
                          {property.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/properties/${property.id}`}>
                            <Button variant="ghost" size="icon" title="Ver Detalhes">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Remover">
                            <Trash2 className="w-4 h-4" />
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

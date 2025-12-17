import { useAuth, api } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Download, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function LeadsPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const leads = isAdmin ? api.getAllLeads() : api.getLeads(user.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold">
            {isAdmin ? 'Todas as Leads' : 'Carteira de Leads'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Gestão global de potenciais compradores.' : 'Gerencie os potenciais compradores.'}
          </p>
        </div>
        {!isAdmin && (
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar Lead
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Procurar lead..." className="pl-9" />
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
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>NIF</TableHead>
                {isAdmin && <TableHead>Mediador Responsável</TableHead>}
                <TableHead>Data de Registo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-muted-foreground">
                    Ainda não existem leads registadas.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => {
                  const mediator = isAdmin ? api.getUser(lead.mediatorId) : null;
                  return (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.nif}</TableCell>
                      {isAdmin && (
                        <TableCell>
                          <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                            {mediator?.fullName || 'Desconhecido'}
                          </span>
                        </TableCell>
                      )}
                      <TableCell>
                        {format(new Date(lead.createdAt), "PPP", { locale: pt })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" title="Download Ficha PDF">
                          <Download className="w-4 h-4" />
                        </Button>
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

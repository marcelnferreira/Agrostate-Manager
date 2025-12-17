import { useAuth } from "@/lib/auth";
import { leadsApi, usersApi } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Download, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { LeadDialog } from "@/components/lead-dialog";

export default function LeadsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const isAdmin = user?.role === 'ADMIN';

  const { data: leads = [], isLoading: loadingLeads } = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadsApi.getAll(),
    enabled: !!user,
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
    enabled: isAdmin,
  });
  
  if (!user) return null;

  const handleLeadAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

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
          <LeadDialog onSuccess={handleLeadAdded} />
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
                <TableHead>NIF</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                {isAdmin && <TableHead>Mediador Responsável</TableHead>}
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-muted-foreground">
                    Ainda não existem leads registadas.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => {
                  const mediator = isAdmin ? users.find(u => u.id === lead.mediatorId) : null;
                  const date = new Date(lead.createdAt);
                  return (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.nif}</TableCell>
                      <TableCell>
                        {format(date, "dd/MM/yyyy", { locale: pt })}
                      </TableCell>
                      <TableCell>
                        {format(date, "HH:mm", { locale: pt })}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                            {mediator?.fullName || 'Desconhecido'}
                          </span>
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" title="Transferir PDF">
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

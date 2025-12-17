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
import { Plus, Download } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function LeadsPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  const leads = api.getLeads(user.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold">Carteira de Leads</h1>
          <p className="text-muted-foreground">Gerencie os potenciais compradores.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Adicionar Lead
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
                <TableHead>Data de Registo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Ainda não tem leads registadas.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell>{lead.nif}</TableCell>
                    <TableCell>
                      {format(new Date(lead.createdAt), "PPP", { locale: pt })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" title="Download Ficha PDF">
                        <Download className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

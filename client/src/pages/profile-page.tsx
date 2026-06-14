import { useAuth } from "@/lib/auth";
import { leadsApi } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, User as UserIcon, Mail, Phone, Calendar, Hash, Plus, Download, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { LeadDialog } from "@/components/lead-dialog";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadsApi.getAll(),
    enabled: !!user,
  });

  if (!user) return null;

  const handleDeleteAccount = () => {
    if (confirm("Tem a certeza que deseja eliminar a sua conta? Esta ação é irreversível.")) {
      toast({
        title: "Conta eliminada",
        description: "A sua conta foi removida com sucesso."
      });
      logout();
    }
  };

  const handleLeadAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-serif font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie as suas informações e carteira de clientes.</p>
      </div>

      {/* Account Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary" />
            <CardTitle>Dados da Conta</CardTitle>
          </div>
          <CardDescription>Informações do seu registo de mediador.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Hash className="w-3 h-3" /> {user.role !== 'ADMIN' ? "ID de Mediador" : "ID de Administrador"}
              </Label>
              <Input value={user.id} readOnly className="bg-muted/50 font-mono" />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-3 h-3" /> Data de Registo
              </Label>
              <Input 
                value={format(new Date(user.createdAt), "PPP", { locale: pt })} 
                readOnly 
                className="bg-muted/50" 
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <UserIcon className="w-3 h-3" /> Nome Completo
              </Label>
              <Input value={user.fullName} readOnly className="bg-muted/50" />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3 h-3" /> Email
              </Label>
              <Input value={user.email} readOnly className="bg-muted/50" />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3 h-3" /> Telefone
              </Label>
              <Input value={user.phone} readOnly className="bg-muted/50" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/20 border-t flex justify-between items-center px-6 py-4">
          <p className="text-xs text-muted-foreground">
            Para alterar estes dados, contacte o suporte.
          </p>
          {user.role !== 'ADMIN' && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDeleteAccount}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" /> Eliminar Conta
            </Button>
          )}
        </CardFooter>
      </Card>

      <Separator />

      {/* Leads Management Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
              Carteira de Leads
            </h2>
            <p className="text-muted-foreground">
              Registe e gerencie os potenciais compradores.
            </p>
          </div>
          <LeadDialog onSuccess={handleLeadAdded} />
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
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 rounded-full bg-muted">
                          <UserIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p>Ainda não tem leads registadas.</p>
                        <LeadDialog 
                          trigger={
                            <Button variant="link" className="text-primary">
                              Adicionar a primeira lead
                            </Button>
                          }
                          onSuccess={handleLeadAdded}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => {
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
    </div>
  );
}

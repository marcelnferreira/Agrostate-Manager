import { useAuth } from "@/lib/auth";
import { usersApi } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Search, Filter, Check, X, Ban, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
    enabled: user?.role === 'ADMIN',
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' }) => 
      usersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Status atualizado",
        description: "O status do utilizador foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Falha ao atualizar status do utilizador.",
      });
    },
  });
  
  if (!user || user.role !== 'ADMIN') return <div>Acesso negado</div>;

  const handleUpdateStatus = (id: string, status: 'ACTIVE' | 'SUSPENDED' | 'REJECTED') => {
    const finalStatus = status === 'REJECTED' ? 'SUSPENDED' : status;
    updateStatusMutation.mutate({ id, status: finalStatus });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ativo</Badge>;
      case 'PENDING': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pendente</Badge>;
      case 'SUSPENDED': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Suspenso</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold">Gestão de Utilizadores</h1>
          <p className="text-muted-foreground">Administração de mediadores e acessos.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Procurar por nome, email..." className="pl-9" />
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
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Registo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{u.fullName.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{u.fullName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">{u.role}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(u.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(u.createdAt), "dd MMM yyyy", { locale: pt })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {u.status === 'PENDING' && (
                        <>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-green-600 hover:bg-green-50" 
                            title="Aprovar"
                            onClick={() => handleUpdateStatus(u.id, 'ACTIVE')}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-red-600 hover:bg-red-50" 
                            title="Rejeitar"
                            onClick={() => handleUpdateStatus(u.id, 'REJECTED')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {u.status === 'ACTIVE' && u.role !== 'ADMIN' && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-orange-600 hover:bg-orange-50" 
                          title="Suspender"
                          onClick={() => handleUpdateStatus(u.id, 'SUSPENDED')}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

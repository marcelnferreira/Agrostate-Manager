import { useAuth } from "@/lib/auth";
import { propertiesApi, leadsApi, usersApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Property } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'ADMIN';

  const { data: properties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ['properties', isAdmin ? 'all' : 'my'],
    queryFn: () => isAdmin ? propertiesApi.getAll() : propertiesApi.getMy(),
    enabled: !!user,
  });

  const { data: leads = [], isLoading: loadingLeads } = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadsApi.getAll(),
    enabled: !!user,
  });

  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
    enabled: isAdmin,
  });

  if (!user) return null;

  const totalUsers = allUsers.length;
  const pendingUsers = allUsers.filter(u => u.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            {isAdmin ? 'Painel de Administração' : 'Painel do Mediador'}
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {user.fullName.split(' ')[0]}.
          </p>
        </div>
        <Link href={isAdmin ? "/admin/properties/new" : "/dashboard/properties/new"}>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Criar Anúncio
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : ''} gap-6`}>
        {isAdmin && (
          <>
            <Link href="/admin/users">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Utilizadores Registados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/users">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Contas Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{pendingUsers}</div>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
        <Link href={isAdmin ? "/admin/properties" : "/dashboard/properties"}>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Anúncios Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{properties.filter(p => p.status === 'ACTIVE').length}</div>
            </CardContent>
          </Card>
        </Link>
        <Link href={isAdmin ? "/admin/leads" : "/dashboard/leads"}>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Leads Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leads.length}</div>
            </CardContent>
          </Card>
        </Link>
        
      </div>

      {/* Recent Properties Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-serif">Anúncios Recentes</h2>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Procurar referência..." className="pl-9" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {properties.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground border-dashed">
              Não tem anúncios registados.
            </Card>
          ) : (
            properties.slice(0, 5).map((property) => (
              <Card key={property.id} className="flex flex-col md:flex-row overflow-hidden hover:bg-muted/10 transition-colors">
                <div className="w-full md:w-48 h-32 md:h-auto bg-muted relative">
                   <img 
                    src={property.images[0]} 
                    alt={property.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-mono text-muted-foreground mb-1">{property.referenceId}</div>
                      <h3 className="font-bold text-lg">{property.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{property.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">
                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(property.price)}
                      </div>
                      <div className="text-xs text-muted-foreground">{property.areaHa} ha</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        property.mediationType === 'EXCLUSIVE' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {property.mediationType === 'EXCLUSIVE' ? 'Exclusivo' : 'Aberto'}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {property.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/properties/${property.id}`}>
                        <Button variant="outline" size="sm">Editar</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

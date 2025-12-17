import { useRoute, Link } from "wouter";
import { api, Property, useAuth } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Maximize, 
  Euro, 
  ArrowLeft,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  Share2,
  Users
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function PropertyDetailPage() {
  const [match, params] = useRoute("/properties/:id");
  const { toast } = useToast();
  const { user } = useAuth();
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadNif, setLeadNif] = useState("");
  
  const property = params?.id ? api.getProperty(params.id) : undefined;

  const getBackLink = () => {
    if (!user) return "/";
    if (user.role === 'ADMIN') return "/admin/properties";
    if (property?.ownerMediatorId === user.id) return "/dashboard/properties";
    return "/dashboard/external-properties";
  };
  
  const backLink = getBackLink();

  const isOwner = user?.id === property?.ownerMediatorId;
  const isAdmin = user?.role === 'ADMIN';
  const showLeads = isOwner || isAdmin;
  
  const leads = showLeads && property ? api.getPropertyLeads(property.id) : [];

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-serif font-bold">Propriedade não encontrada</h1>
        <Link href={backLink}>
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
        </Link>
      </div>
    );
  }

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Interesse Registado!",
      description: "O mediador responsável entrará em contacto brevemente."
    });
    setLeadName("");
    setLeadEmail("");
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'FACEBOOK': return <Facebook className="w-5 h-5" />;
      case 'INSTAGRAM': return <Instagram className="w-5 h-5" />;
      case 'LINKEDIN': return <Linkedin className="w-5 h-5" />;
      case 'YOUTUBE': return <Youtube className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  const getSocialColor = (platform: string) => {
    switch (platform) {
      case 'FACEBOOK': return 'hover:bg-[#1877F2] hover:text-white';
      case 'INSTAGRAM': return 'hover:bg-[#E4405F] hover:text-white';
      case 'LINKEDIN': return 'hover:bg-[#0A66C2] hover:text-white';
      case 'YOUTUBE': return 'hover:bg-[#FF0000] hover:text-white';
      default: return 'hover:bg-primary hover:text-white';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Image */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img 
          src={property.images[0]} 
          alt={property.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
          <Link href={backLink}>
            <Button variant="outline" className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar à Lista
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="text-white space-y-2">
              <Badge className="bg-primary hover:bg-primary/90 text-white border-none">
                {property.mediationType === 'EXCLUSIVE' ? 'Mediação Exclusiva' : 'Em Aberto'}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-serif font-bold">{property.title}</h1>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{property.location}</span>
              </div>
            </div>
            <div className="text-white md:text-right">
              <p className="text-3xl md:text-4xl font-bold">
                {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(property.price)}
              </p>
              <p className="text-white/80">{property.areaHa} hectares</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Social Links Section - Highlighted Feature */}
          {property.socialLinks && property.socialLinks.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Multimédia & Social:
              </span>
              <div className="flex gap-2">
                {property.socialLinks.map((link, idx) => (
                  <a 
                    key={idx} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`p-2 rounded-full bg-background border border-border text-foreground transition-all duration-300 ${getSocialColor(link.platform)}`}
                    title={`Ver no ${link.platform}`}
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="prose prose-lg max-w-none text-muted-foreground">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Sobre a Propriedade</h2>
            <p className="whitespace-pre-line">{property.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-8 border-t border-b">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Referência</span>
              <p className="font-medium">{property.referenceId}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Área Total</span>
              <p className="font-medium flex items-center gap-1">
                <Maximize className="w-4 h-4 text-primary" />
                {property.areaHa} ha
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Valor / ha</span>
              <p className="font-medium flex items-center gap-1">
                <Euro className="w-4 h-4 text-primary" />
                {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price / property.areaHa)}
              </p>
            </div>
          </div>

          {showLeads && (
            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-serif font-bold text-foreground">Leads Registadas</h2>
              </div>
              
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Data</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nome</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Contacto</th>
                        {isAdmin && <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Mediador</th>}
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {leads.length === 0 ? (
                        <tr>
                          <td colSpan={isAdmin ? 4 : 3} className="p-4 text-center text-muted-foreground">
                            Ainda não existem leads registadas para este imóvel.
                          </td>
                        </tr>
                      ) : (
                        leads.map((lead) => {
                          const mediator = isAdmin ? api.getUser(lead.mediatorId) : null;
                          return (
                            <tr key={lead.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                              <td className="p-4 align-middle">
                                {format(new Date(lead.createdAt), "dd MMM yyyy", { locale: pt })}
                              </td>
                              <td className="p-4 align-middle font-medium">{lead.name}</td>
                              <td className="p-4 align-middle">
                                <div className="flex flex-col">
                                  <span>{lead.email}</span>
                                  <span className="text-xs text-muted-foreground">{lead.phone}</span>
                                </div>
                              </td>
                              {isAdmin && (
                                <td className="p-4 align-middle">
                                  <div className="flex flex-col">
                                    <span className="font-medium">{mediator?.fullName || 'N/A'}</span>
                                    <span className="text-xs text-muted-foreground">{mediator?.email}</span>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Form */}
        {!showLeads && (
          <div className="space-y-6">
            <Card className="sticky top-24 shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="font-serif">Tenho Interesse</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input 
                      id="name" 
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nif">NIF (Opcional)</Label>
                    <Input 
                      id="nif" 
                      value={leadNif}
                      onChange={(e) => setLeadNif(e.target.value)} 
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg mt-2">
                    Contactar Mediador
                  </Button>
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    Ao submeter, concorda com a nossa política de privacidade.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

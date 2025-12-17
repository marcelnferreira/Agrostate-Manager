import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/mock-data";
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  Settings, 
  LogOut, 
  PlusCircle, 
  BriefcaseBusiness,
  Menu,
  X,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import logoImg from "@assets/generated_images/minimalist_logo_icon_for_agrostate.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return <>{children}</>;

  const isActive = (path: string) => location === path;

  const NavItem = ({ href, icon: Icon, label, exact = false }: { href: string, icon: any, label: string, exact?: boolean }) => (
    <Link href={href}>
      <a className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        (exact ? location === href : location.startsWith(href))
          ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium' 
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      }`}>
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </a>
    </Link>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-6 flex items-center gap-3">
        <img src={logoImg} alt="Agrostate" className="w-8 h-8 object-contain" />
        <span className="font-serif text-xl font-bold tracking-tight">Agrostate</span>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1">
        {user.role === 'ADMIN' ? (
          <>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mt-2">
              Administração
            </div>
            <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" exact />
            <NavItem href="/admin/users" icon={Users} label="Utilizadores" />
            <NavItem href="/admin/properties" icon={Home} label="Todas as Propriedades" />
          </>
        ) : (
          <>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mt-2">
              Mercado
            </div>
            <NavItem href="/dashboard/external-properties" icon={Globe} label="Anúncios Externos" />

            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mt-6">
              Mediação
            </div>
            <NavItem href="/dashboard" icon={LayoutDashboard} label="Painel" exact />
            <NavItem href="/dashboard/properties" icon={Home} label="Meus Anúncios" />
            <NavItem href="/dashboard/leads" icon={BriefcaseBusiness} label="Carteira de Leads" />
          </>
        )}

        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mt-6">
          Conta
        </div>
        <NavItem href="/profile" icon={Settings} label="Perfil" />
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <Avatar className="w-8 h-8 bg-sidebar-primary">
            <AvatarFallback className="text-sidebar-primary-foreground">
              {user.fullName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.fullName}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-sidebar-border bg-transparent"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Terminar Sessão
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden fixed top-4 left-4 z-50 p-2">
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 border-r-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}

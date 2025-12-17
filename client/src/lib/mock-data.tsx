import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

// Types
export type UserRole = 'ADMIN' | 'MEDIATOR';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nif?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export type PropertyStatus = 'ACTIVE' | 'SUSPENDED' | 'SOLD';
export type MediationType = 'EXCLUSIVE' | 'OPEN';

export interface SocialLink {
  platform: 'WEBSITE' | 'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN' | 'YOUTUBE';
  url: string;
}

export interface Property {
  id: string;
  referenceId: string;
  title: string;
  description: string;
  location: string;
  areaHa: number;
  price: number;
  mediationType: MediationType;
  status: PropertyStatus;
  images: string[];
  socialLinks: SocialLink[];
  ownerMediatorId: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  nif: string;
  propertyId?: string; // If interested in specific property
  mediatorId: string; // The mediator who owns this lead
  createdAt: string;
}

// Mock Data
const MOCK_USERS: User[] = [
  {
    id: 'u1',
    fullName: 'Admin User',
    email: 'admin@agrostate.com',
    phone: '+351 910 000 000',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2023-01-01',
  },
  {
    id: 'u2',
    fullName: 'João Silva',
    email: 'joao@mediator.com',
    phone: '+351 912 345 678',
    role: 'MEDIATOR',
    status: 'ACTIVE',
    createdAt: '2023-02-15',
  },
  {
    id: 'u3',
    fullName: 'Maria Santos',
    email: 'maria@mediator.com',
    phone: '+351 919 876 543',
    role: 'MEDIATOR',
    status: 'PENDING',
    createdAt: '2023-12-10',
  }
];

// Import assets (simulated)
import heroImg from '@assets/generated_images/aerial_view_of_agricultural_land_and_farms.png';

const MOCK_PROPERTIES: Property[] = [
  {
    id: 'p1',
    referenceId: 'REF-2024-001',
    title: 'Herdade do Sol',
    description: 'Magnífica herdade no Alentejo com 50 hectares de vinha e olival. Casa principal recuperada com piscina e vista panorâmica.',
    location: 'Évora, Alentejo',
    areaHa: 120,
    price: 1500000,
    mediationType: 'EXCLUSIVE',
    status: 'ACTIVE',
    images: [heroImg],
    socialLinks: [
      { platform: 'INSTAGRAM', url: 'https://instagram.com/herdadesol' }
    ],
    ownerMediatorId: 'u2',
    createdAt: '2024-01-10',
  },
  {
    id: 'p2',
    referenceId: 'REF-2024-002',
    title: 'Quinta das Oliveiras',
    description: 'Terreno agrícola com excelente aptidão para culturas de regadio. Barragem própria e armazém agrícola.',
    location: 'Santarém, Ribatejo',
    areaHa: 45,
    price: 450000,
    mediationType: 'OPEN',
    status: 'ACTIVE',
    images: [heroImg], // Reusing for mock
    socialLinks: [],
    ownerMediatorId: 'u2',
    createdAt: '2024-02-05',
  },
   {
    id: 'p3',
    referenceId: 'REF-2024-003',
    title: 'Monte Alentejano',
    description: 'Pequena quinta de lazer com 2 hectares, ideal para turismo rural. Casa típica para recuperar.',
    location: 'Beja, Alentejo',
    areaHa: 2,
    price: 180000,
    mediationType: 'OPEN',
    status: 'ACTIVE',
    images: [heroImg],
    socialLinks: [],
    ownerMediatorId: 'u2',
    createdAt: '2024-03-12',
  }
];

const MOCK_LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'Carlos Comprador',
    email: 'carlos@buyer.com',
    phone: '911222333',
    nif: '200300400',
    mediatorId: 'u2',
    createdAt: '2024-03-01',
  }
];

// Context
interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate session check
    const storedUser = localStorage.getItem('agrostate_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = MOCK_USERS.find(u => u.email === email);
    
    if (foundUser) {
      if (foundUser.status === 'PENDING') {
        toast({
          variant: "destructive",
          title: "Conta Pendente",
          description: "A sua conta ainda está a aguardar aprovação do administrador."
        });
        setIsLoading(false);
        return;
      }
      if (foundUser.status === 'SUSPENDED') {
        toast({
          variant: "destructive",
          title: "Conta Suspensa",
          description: "Contacte o administrador para mais informações."
        });
        setIsLoading(false);
        return;
      }
      
      setUser(foundUser);
      localStorage.setItem('agrostate_user', JSON.stringify(foundUser));
      toast({
        title: "Bem-vindo de volta!",
        description: `Olá, ${foundUser.fullName}`
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erro de login",
        description: "Utilizador não encontrado (Use 'admin@agrostate.com' ou 'joao@mediator.com')"
      });
    }
    setIsLoading(false);
  };

  const register = async (data: any) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Registo submetido",
      description: "A sua conta foi criada e está pendente de aprovação."
    });
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agrostate_user');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Data Access Layer (Mock)
export const api = {
  getProperties: () => MOCK_PROPERTIES,
  getProperty: (id: string) => MOCK_PROPERTIES.find(p => p.id === id),
  getUserProperties: (userId: string) => MOCK_PROPERTIES.filter(p => p.ownerMediatorId === userId),
  getAllLeads: () => MOCK_LEADS,
  getLeads: (mediatorId: string) => MOCK_LEADS.filter(l => l.mediatorId === mediatorId),
  getUser: (id: string) => MOCK_USERS.find(u => u.id === id),
  getAllUsers: () => MOCK_USERS, // Admin only
  deleteProperty: (id: string) => {
    // In a real app this would delete from server
    console.log('Deleting property', id);
    return true;
  }
};

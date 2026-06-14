import type { User, Property, Lead, InsertUser, InsertProperty, InsertLead } from "@shared/schema";

const API_BASE = "/api";

// Auth API
export const authApi = {
  async register(data: InsertUser): Promise<{ message: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Registration failed");
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Login failed");
    }
    return res.json();
  },

  async logout(): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Logout failed");
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
  },
};

// Users API
export const usersApi = {
  async getAll(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  },

  async updateStatus(id: string, status: "PENDING" | "ACTIVE" | "SUSPENDED"): Promise<void> {
    const res = await fetch(`${API_BASE}/users/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update user status");
    }
  },
};

// Properties API
export const propertiesApi = {
  async getFeatured(): Promise<Property[]> {
    // AI_GENERATED_CODE_START
    // Descrição: Buscar propriedades em destaque (top 3) para landing page
    // Gerado por: Cursor AI
    // Versão: Fetch API
    // AI_GENERATED_CODE_END
    const res = await fetch(`${API_BASE}/properties/featured`);
    if (!res.ok) throw new Error("Failed to fetch featured properties");
    return res.json();
  },

  async getAll(): Promise<Property[]> {
    const res = await fetch(`${API_BASE}/properties`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch properties");
    return res.json();
  },

  async getMy(): Promise<Property[]> {
    const res = await fetch(`${API_BASE}/properties/my`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch your properties");
    return res.json();
  },

  async getById(id: string): Promise<Property> {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch property");
    return res.json();
  },

  async create(data: InsertProperty): Promise<Property> {
    const res = await fetch(`${API_BASE}/properties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create property");
    }
    return res.json();
  },

  async update(id: string, data: Partial<InsertProperty>): Promise<Property> {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update property");
    }
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to delete property");
    }
  },
};

// Leads API
export const leadsApi = {
  async getAll(): Promise<Lead[]> {
    const res = await fetch(`${API_BASE}/leads`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch leads");
    return res.json();
  },

  async getByPropertyId(propertyId: string): Promise<Lead[]> {
    const res = await fetch(`${API_BASE}/leads/property/${propertyId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch property leads");
    return res.json();
  },

  async create(data: InsertLead): Promise<Lead> {
    const res = await fetch(`${API_BASE}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create lead");
    }
    return res.json();
  },
};

// Upload API
export const uploadApi = {
  // AI_GENERATED_CODE_START
  // Descrição: Função para upload de imagens
  // Gerado por: Cursor AI
  // Versão: Fetch API
  // AI_GENERATED_CODE_END
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);
    
    const res = await fetch(`${API_BASE}/upload/image`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Falha ao fazer upload da imagem");
    }
    
    const data = await res.json();
    return data.url;
  },
};
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPropertySchema, insertLeadSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";
import memorystore from "memorystore";

const MemoryStore = memorystore(session);

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'agrostate-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
  }));

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    next();
  };

  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Acesso negado" });
    }
    req.user = user;
    next();
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existing = await storage.getUserByEmail(validatedData.email);
      if (existing) {
        return res.status(400).json({ error: "Email já registado" });
      }

      const user = await storage.createUser(validatedData);
      const { password, ...userWithoutPassword } = user;
      
      res.json({ 
        message: "Conta criada com sucesso. Aguarde aprovação do administrador.",
        user: userWithoutPassword 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Email ou password incorretos" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Email ou password incorretos" });
      }

      if (user.status === 'PENDING') {
        return res.status(403).json({ error: "Conta pendente de aprovação" });
      }

      if (user.status === 'SUSPENDED') {
        return res.status(403).json({ error: "Conta suspensa" });
      }

      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao terminar sessão" });
      }
      res.json({ message: "Sessão terminada" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "Utilizador não encontrado" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // User Management Routes (Admin only)
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/users/:id/status", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['PENDING', 'ACTIVE', 'SUSPENDED'].includes(status)) {
        return res.status(400).json({ error: "Estado inválido" });
      }

      const success = await storage.updateUserStatus(id, status);
      if (!success) {
        return res.status(404).json({ error: "Utilizador não encontrado" });
      }

      res.json({ message: "Estado atualizado com sucesso" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Property Routes
  app.get("/api/properties", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      let allProperties;
      
      if (user?.role === 'ADMIN') {
        allProperties = await storage.getProperties();
      } else {
        allProperties = await storage.getProperties();
      }
      
      res.json(allProperties);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/properties/my", requireAuth, async (req, res) => {
    try {
      const properties = await storage.getUserProperties(req.session.userId!);
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/properties/:id", requireAuth, async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Propriedade não encontrada" });
      }
      res.json(property);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/properties", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(
        validatedData,
        req.session.userId!
      );
      res.json(property);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/properties/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ error: "Propriedade não encontrada" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (property.ownerMediatorId !== req.session.userId && user?.role !== 'ADMIN') {
        return res.status(403).json({ error: "Sem permissão para editar esta propriedade" });
      }

      const updated = await storage.updateProperty(id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/properties/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ error: "Propriedade não encontrada" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (property.ownerMediatorId !== req.session.userId && user?.role !== 'ADMIN') {
        return res.status(403).json({ error: "Sem permissão para eliminar esta propriedade" });
      }

      await storage.deleteProperty(id);
      res.json({ message: "Propriedade eliminada" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Lead Routes
  app.get("/api/leads", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      let allLeads;
      
      if (user?.role === 'ADMIN') {
        allLeads = await storage.getAllLeads();
      } else {
        allLeads = await storage.getLeads(req.session.userId!);
      }
      
      res.json(allLeads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/leads/property/:propertyId", requireAuth, async (req, res) => {
    try {
      const leads = await storage.getPropertyLeads(req.params.propertyId);
      res.json(leads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/leads", requireAuth, async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      res.json(lead);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return httpServer;
}

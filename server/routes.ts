import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPropertySchema, insertLeadSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";
import memorystore from "memorystore";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

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
  // AI_GENERATED_CODE_START
  // Descrição: Configuração de upload de imagens com multer
  // Gerado por: Cursor AI
  // Versão: multer, express
  // AI_GENERATED_CODE_END
  
  // Configurar diretório de uploads
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const uploadsDir = path.join(__dirname, "..", "uploads");
  
  // Criar diretório de uploads se não existir
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Configurar multer para salvar arquivos
  const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `image-${uniqueSuffix}${ext}`);
    },
  });
  
  const upload = multer({
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new Error("Apenas imagens são permitidas (JPG, PNG, GIF, WEBP)"));
      }
    },
  });
  
  // Servir arquivos estáticos de uploads
  app.use("/uploads", express.static(uploadsDir));
  
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
  // Public endpoint for featured properties (landing page)
  // IMPORTANT: This route must be defined BEFORE /api/properties/:id to avoid route conflicts
  app.get("/api/properties/featured", async (req, res) => {
    try {
      // AI_GENERATED_CODE_START
      // Descrição: Endpoint público para retornar top 3 propriedades em destaque
      // Gerado por: Cursor AI
      // Versão: Express, Node.js
      // AI_GENERATED_CODE_END
      // This is a public endpoint - no authentication required
      // Explicitly allow requests without authentication
      console.log('[DEBUG] /api/properties/featured - Public endpoint accessed');
      const featuredProperties = await storage.getFeaturedProperties(3);
      return res.json(featuredProperties);
    } catch (error: any) {
      console.error('[ERROR] /api/properties/featured:', error);
      return res.status(500).json({ error: error.message });
    }
  });

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
      // AI_GENERATED_CODE_START
      // Descrição: Permitir que admin selecione o mediador principal ao criar propriedade
      // Gerado por: Cursor AI
      // Versão: Node.js, Express
      // AI_GENERATED_CODE_END
      
      // Garantir que images seja um array
      if (req.body.images && !Array.isArray(req.body.images)) {
        req.body.images = [];
      }
      
      const validatedData = insertPropertySchema.parse(req.body);
      const user = await storage.getUser(req.session.userId!);
      
      // Se for admin e forneceu ownerMediatorId, usar o fornecido, senão usar o userId da sessão
      let ownerMediatorId = req.session.userId!;
      if (user?.role === 'ADMIN' && validatedData.ownerMediatorId) {
        // Validar que o ownerMediatorId fornecido existe e é um mediador
        const selectedMediator = await storage.getUser(validatedData.ownerMediatorId);
        if (!selectedMediator) {
          return res.status(400).json({ error: "Mediador selecionado não encontrado" });
        }
        if (selectedMediator.role !== 'MEDIATOR') {
          return res.status(400).json({ error: "O utilizador selecionado não é um mediador" });
        }
        ownerMediatorId = validatedData.ownerMediatorId;
      }
      
      // Remover ownerMediatorId dos dados validados antes de passar para createProperty
      const { ownerMediatorId: _, ...propertyData } = validatedData;
      
      // Garantir que images seja um array válido
      if (!propertyData.images || !Array.isArray(propertyData.images)) {
        propertyData.images = [];
      }
      
      const property = await storage.createProperty(
        propertyData,
        ownerMediatorId
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

      // Garantir que images seja um array se fornecido
      if (req.body.images && !Array.isArray(req.body.images)) {
        req.body.images = [];
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

  // Upload Routes
  app.post("/api/upload/image", requireAuth, upload.single("image"), async (req, res) => {
    try {
      // AI_GENERATED_CODE_START
      // Descrição: Endpoint para upload de imagens de propriedades
      // Gerado por: Cursor AI
      // Versão: multer, express
      // AI_GENERATED_CODE_END
      
      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem enviada" });
      }
      
      // Retornar URL da imagem
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ url: imageUrl });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Erro ao fazer upload da imagem" });
    }
  });

  return httpServer;
}

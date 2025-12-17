import { db } from "@db";
import { 
  users, properties, leads,
  type User, type InsertUser,
  type Property, type InsertProperty,
  type Lead, type InsertLead
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserStatus(id: string, status: "PENDING" | "ACTIVE" | "SUSPENDED"): Promise<boolean>;
  
  // Properties
  getProperty(id: string): Promise<Property | undefined>;
  getProperties(): Promise<Property[]>;
  getUserProperties(userId: string): Promise<Property[]>;
  createProperty(property: InsertProperty, ownerMediatorId: string): Promise<Property>;
  updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
  
  // Leads
  getLead(id: string): Promise<Lead | undefined>;
  getLeads(mediatorId: string): Promise<Lead[]>;
  getAllLeads(): Promise<Lead[]>;
  getPropertyLeads(propertyId: string): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserStatus(id: string, status: "PENDING" | "ACTIVE" | "SUSPENDED"): Promise<boolean> {
    const result = await db.update(users)
      .set({ status })
      .where(eq(users.id, id))
      .returning();
    return result.length > 0;
  }

  // Properties
  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async getProperties(): Promise<Property[]> {
    return await db.select().from(properties);
  }

  async getUserProperties(userId: string): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.ownerMediatorId, userId));
  }

  async createProperty(insertProperty: InsertProperty, ownerMediatorId: string): Promise<Property> {
    // Generate reference ID
    const count = await db.select({ count: sql`count(*)` }).from(properties);
    const referenceId = `REF-${new Date().getFullYear()}-${String(Number(count[0].count) + 1).padStart(3, '0')}`;
    
    const [property] = await db.insert(properties).values({
      ...insertProperty,
      referenceId,
      ownerMediatorId,
    }).returning();
    return property;
  }

  async updateProperty(id: string, updateData: Partial<InsertProperty>): Promise<Property | undefined> {
    const [property] = await db.update(properties)
      .set(updateData)
      .where(eq(properties.id, id))
      .returning();
    return property;
  }

  async deleteProperty(id: string): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id)).returning();
    return result.length > 0;
  }

  // Leads
  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async getLeads(mediatorId: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.mediatorId, mediatorId));
  }

  async getAllLeads(): Promise<Lead[]> {
    return await db.select().from(leads);
  }

  async getPropertyLeads(propertyId: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.propertyId, propertyId));
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }
}

export const storage = new DatabaseStorage();

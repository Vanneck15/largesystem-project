import { 
  type User, 
  type InsertUser, 
  type Query, 
  type InsertQuery,
  type UserAnalytics,
  type FeatureUsage,
  type ConversionMetrics,
  users,
  queries,
  userAnalytics,
  featureUsage,
  conversionMetrics
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Query methods
  getQueries(): Promise<Query[]>;
  getQuery(id: string): Promise<Query | undefined>;
  createQuery(query: InsertQuery): Promise<Query>;
  updateQuery(id: string, updates: Partial<InsertQuery>): Promise<Query>;
  deleteQuery(id: string): Promise<void>;
  getFavoriteQueries(): Promise<Query[]>;
  
  // Analytics methods
  executeRawQuery(sqlQuery: string): Promise<any[]>;
  
  // Sample data methods
  getSampleUserAnalytics(limit?: number): Promise<UserAnalytics[]>;
  getSampleFeatureUsage(limit?: number): Promise<FeatureUsage[]>;
  getSampleConversionMetrics(limit?: number): Promise<ConversionMetrics[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getQueries(): Promise<Query[]> {
    return await db.select().from(queries).orderBy(desc(queries.createdAt));
  }

  async getQuery(id: string): Promise<Query | undefined> {
    const [query] = await db.select().from(queries).where(eq(queries.id, id));
    return query || undefined;
  }

  async createQuery(insertQuery: InsertQuery): Promise<Query> {
    const [query] = await db
      .insert(queries)
      .values(insertQuery)
      .returning();
    return query;
  }

  async updateQuery(id: string, updates: Partial<InsertQuery>): Promise<Query> {
    const [query] = await db
      .update(queries)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(eq(queries.id, id))
      .returning();
    return query;
  }

  async deleteQuery(id: string): Promise<void> {
    await db.delete(queries).where(eq(queries.id, id));
  }

  async getFavoriteQueries(): Promise<Query[]> {
    return await db
      .select()
      .from(queries)
      .where(eq(queries.isFavorite, true))
      .orderBy(desc(queries.createdAt));
  }

  async executeRawQuery(sqlQuery: string): Promise<any[]> {
    try {
      const result = await db.execute(sql.raw(sqlQuery));
      return result.rows as any[];
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  async getSampleUserAnalytics(limit = 100): Promise<UserAnalytics[]> {
    return await db.select().from(userAnalytics).limit(limit).orderBy(desc(userAnalytics.createdAt));
  }

  async getSampleFeatureUsage(limit = 100): Promise<FeatureUsage[]> {
    return await db.select().from(featureUsage).limit(limit).orderBy(desc(featureUsage.usageDate));
  }

  async getSampleConversionMetrics(limit = 100): Promise<ConversionMetrics[]> {
    return await db.select().from(conversionMetrics).limit(limit).orderBy(desc(conversionMetrics.stepCompletedAt));
  }
}

export const storage = new DatabaseStorage();

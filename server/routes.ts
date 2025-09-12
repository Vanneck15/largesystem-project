import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSqlFromNaturalLanguage, generateInsights } from "./services/openai";
import { insertQuerySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Query routes
  app.get("/api/queries", async (req, res) => {
    try {
      const queries = await storage.getQueries();
      res.json(queries);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/queries/favorites", async (req, res) => {
    try {
      const queries = await storage.getFavoriteQueries();
      res.json(queries);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/queries/generate", async (req, res) => {
    try {
      const { naturalLanguageQuery } = req.body;
      
      if (!naturalLanguageQuery) {
        return res.status(400).json({ message: "Natural language query is required" });
      }

      const result = await generateSqlFromNaturalLanguage(naturalLanguageQuery);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/queries/execute", async (req, res) => {
    try {
      const { sqlQuery, naturalLanguageQuery, title } = req.body;
      
      if (!sqlQuery) {
        return res.status(400).json({ message: "SQL query is required" });
      }

      const startTime = Date.now();
      const results = await storage.executeRawQuery(sqlQuery);
      const executionTime = Date.now() - startTime;

      // Save query to history
      if (naturalLanguageQuery && title) {
        await storage.createQuery({
          title,
          naturalLanguageQuery,
          sqlQuery,
          executionTime,
          resultCount: results.length,
          isFavorite: false
        });
      }

      // Generate insights
      const insights = results.length > 0 
        ? await generateInsights(results, naturalLanguageQuery || sqlQuery)
        : [];

      res.json({
        results,
        executionTime,
        resultCount: results.length,
        insights
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/queries", async (req, res) => {
    try {
      const validatedData = insertQuerySchema.parse(req.body);
      const query = await storage.createQuery(validatedData);
      res.status(201).json(query);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid query data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/queries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const query = await storage.updateQuery(id, updates);
      res.json(query);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/queries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteQuery(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Sample data routes
  app.get("/api/sample-data/user-analytics", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const data = await storage.getSampleUserAnalytics(limit);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sample-data/feature-usage", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const data = await storage.getSampleFeatureUsage(limit);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/sample-data/conversion-metrics", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const data = await storage.getSampleConversionMetrics(limit);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

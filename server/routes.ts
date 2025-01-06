import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { books, posts, users } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Get books with optional age group filter
  app.get("/api/books", async (req, res) => {
    try {
      const ageGroup = req.query.age as string;
      const query = ageGroup
        ? db.select().from(books).where(eq(books.ageGroup, ageGroup))
        : db.select().from(books);

      const results = await query;
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  // Get community posts with user information
  app.get("/api/posts", async (req, res) => {
    try {
      const results = await db.select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        userId: posts.userId,
        username: users.username,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(posts.createdAt);

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Create a new post
  app.post("/api/posts", async (req, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const [post] = await db
        .insert(posts)
        .values({
          content: req.body.content,
          userId: user.id,
        })
        .returning();

      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
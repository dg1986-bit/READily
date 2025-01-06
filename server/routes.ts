import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { books, posts, users, borrowings, libraries, reservations } from "@db/schema";
import { eq, and, isNull } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // First, setup authentication routes
  setupAuth(app);

  // Get all libraries
  app.get("/api/libraries", async (_req, res) => {
    try {
      const results = await db.select().from(libraries);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch libraries" });
    }
  });

  // Get books with optional age group and library filters
  app.get("/api/books", async (req, res) => {
    try {
      const ageGroup = req.query.age as string;
      const libraryId = req.query.libraryId ? parseInt(req.query.libraryId as string) : undefined;

      let query = db.select({
        id: books.id,
        title: books.title,
        author: books.author,
        description: books.description,
        ageGroup: books.ageGroup,
        library: libraries,
      }).from(books)
        .leftJoin(libraries, eq(books.libraryId, libraries.id));

      if (ageGroup) {
        query = query.where(eq(books.ageGroup, ageGroup));
      }

      if (libraryId) {
        query = query.where(eq(books.libraryId, libraryId));
      }

      const results = await query;
      res.json(results);
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  // Reserve a book
  app.post("/api/books/reserve", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const bookId = req.body.bookId;
    if (!bookId) {
      return res.status(400).json({ error: "Book ID is required" });
    }

    try {
      // Check if book exists
      const [book] = await db.select().from(books).where(eq(books.id, bookId));
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      // Check if user already has an active reservation for this book
      const [existingReservation] = await db
        .select()
        .from(reservations)
        .where(
          and(
            eq(reservations.bookId, bookId),
            eq(reservations.userId, req.user.id),
            eq(reservations.status, 'pending')
          )
        );

      if (existingReservation) {
        return res.status(400).json({ error: "You already have a pending reservation for this book" });
      }

      // Create new reservation record
      const [reservation] = await db
        .insert(reservations)
        .values({
          userId: req.user.id,
          bookId: bookId,
          status: 'pending',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        })
        .returning();

      res.json(reservation);
    } catch (error) {
      res.status(500).json({ error: "Failed to reserve book" });
    }
  });

  // Get user's reservations
  app.get("/api/books/reserved", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const reservedBooks = await db
        .select({
          id: books.id,
          title: books.title,
          author: books.author,
          description: books.description,
          ageGroup: books.ageGroup,
          reservationId: reservations.id,
          status: reservations.status,
          createdAt: reservations.createdAt,
          expiresAt: reservations.expiresAt,
          library: libraries,
        })
        .from(reservations)
        .leftJoin(books, eq(reservations.bookId, books.id))
        .leftJoin(libraries, eq(books.libraryId, libraries.id))
        .where(eq(reservations.userId, req.user.id))
        .where(eq(reservations.status, 'pending'));

      res.json(reservedBooks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reserved books" });
    }
  });

  // Cancel a reservation
  app.post("/api/books/reserve/cancel", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const reservationId = req.body.reservationId;
    if (!reservationId) {
      return res.status(400).json({ error: "Reservation ID is required" });
    }

    try {
      const [reservation] = await db
        .update(reservations)
        .set({ status: 'cancelled' })
        .where(
          and(
            eq(reservations.id, reservationId),
            eq(reservations.userId, req.user.id),
            eq(reservations.status, 'pending')
          )
        )
        .returning();

      if (!reservation) {
        return res.status(404).json({ error: "Reservation not found or already processed" });
      }

      res.json(reservation);
    } catch (error) {
      res.status(500).json({ error: "Failed to cancel reservation" });
    }
  });

  // Borrow a book
  app.post("/api/books/borrow", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const bookId = req.body.bookId;
    if (!bookId) {
      return res.status(400).json({ error: "Book ID is required" });
    }

    try {
      // Check if book exists
      const [book] = await db.select().from(books).where(eq(books.id, bookId));
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      // Check if book is already borrowed by this user
      const [existingBorrowing] = await db
        .select()
        .from(borrowings)
        .where(eq(borrowings.bookId, bookId))
        .where(eq(borrowings.userId, req.user.id))
        .where(eq(borrowings.status, 'borrowed'));

      if (existingBorrowing) {
        return res.status(400).json({ error: "You have already borrowed this book" });
      }

      // Create new borrowing record
      const [borrowing] = await db
        .insert(borrowings)
        .values({
          userId: req.user.id,
          bookId: bookId,
          status: 'borrowed'
        })
        .returning();

      res.json(borrowing);
    } catch (error) {
      res.status(500).json({ error: "Failed to borrow book" });
    }
  });

  // Get user's borrowed books
  app.get("/api/books/borrowed", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const borrowedBooks = await db
        .select({
          id: books.id,
          title: books.title,
          author: books.author,
          description: books.description,
          ageGroup: books.ageGroup,
          borrowedAt: borrowings.borrowedAt,
          status: borrowings.status
        })
        .from(borrowings)
        .leftJoin(books, eq(borrowings.bookId, books.id))
        .where(eq(borrowings.userId, req.user.id))
        .where(eq(borrowings.status, 'borrowed'));

      res.json(borrowedBooks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch borrowed books" });
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
        username: users.email, // This remains as email for now, needs schema change
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
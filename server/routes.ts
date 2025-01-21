import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { books, posts, users, borrowings, libraries, reservations } from "@db/schema";
import { eq, and, isNull, count, lt, gte, ilike, or } from "drizzle-orm";
import { addDays } from "date-fns";

const AGE_GROUP_MAPPING = {
  '0-2 years': ['infant', 'toddler'],
  '3-5 years': ['preschool'],
  '6-8 years': ['early-reader'],
  '9-12 years': ['middle-grade']
};

export function registerRoutes(app: Express): Server {
  // First, setup authentication routes
  setupAuth(app);

  // Get all libraries
  app.get("/api/libraries", async (_req, res) => {
    try {
      const results = await db.select().from(libraries);
      res.json(results);
    } catch (error) {
      console.error('Error fetching libraries:', error);
      res.status(500).json({ error: "Failed to fetch libraries" });
    }
  });

  // Get books with optional age group and library filters
  app.get("/api/books", async (req, res) => {
    try {
      const ageGroup = req.query.age as string;
      const searchQuery = req.query.search as string;
      const categories = req.query.categories ? (req.query.categories as string).split(',') : [];
      const userId = req.user?.id;

      // First get the books with library info
      let query = db.select({
        id: books.id,
        title: books.title,
        author: books.author,
        description: books.description,
        ageGroup: books.ageGroup,
        imageUrl: books.imageUrl,
        format: books.format,
        totalCopies: books.totalCopies,
        loanPeriodDays: books.loanPeriodDays,
        library: libraries,
        categories: books.categories,
      }).from(books)
        .leftJoin(libraries, eq(books.libraryId, libraries.id));

      const conditions = [];

      // Handle age group filtering
      if (ageGroup && AGE_GROUP_MAPPING[ageGroup]) {
        conditions.push(
          or(
            ...AGE_GROUP_MAPPING[ageGroup].map(group => eq(books.ageGroup, group))
          )
        );
      }

      if (searchQuery) {
        conditions.push(
          or(
            ilike(books.title, `%${searchQuery}%`),
            ilike(books.author, `%${searchQuery}%`)
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      let booksResult = await query;

      // Filter by categories if specified
      if (categories.length > 0) {
        booksResult = booksResult.filter(book => {
          const bookCategories = book.categories ? JSON.parse(book.categories) : [];
          return categories.some(category => bookCategories.includes(category));
        });
      }

      // For each book, get availability information
      const booksWithAvailability = await Promise.all(
        booksResult.map(async (book) => {
          // Get current active borrowings count
          const [{ activeBorrowings }] = await db
            .select({
              activeBorrowings: count(),
            })
            .from(borrowings)
            .where(
              and(
                eq(borrowings.bookId, book.id),
                eq(borrowings.status, 'borrowed')
              )
            );

          // Get hold queue length
          const [{ holdCount }] = await db
            .select({
              holdCount: count(),
            })
            .from(reservations)
            .where(
              and(
                eq(reservations.bookId, book.id),
                eq(reservations.status, 'pending')
              )
            );

          // Get user's current borrowing if any
          let userBorrowing = null;
          if (userId) {
            const [currentBorrowing] = await db
              .select()
              .from(borrowings)
              .where(
                and(
                  eq(borrowings.bookId, book.id),
                  eq(borrowings.userId, userId),
                  eq(borrowings.status, 'borrowed')
                )
              );
            userBorrowing = currentBorrowing;
          }

          // Get user's current reservation if any
          let userReservation = null;
          if (userId) {
            const [currentReservation] = await db
              .select()
              .from(reservations)
              .where(
                and(
                  eq(reservations.bookId, book.id),
                  eq(reservations.userId, userId),
                  eq(reservations.status, 'pending')
                )
              );
            userReservation = currentReservation;
          }

          const availableCopies = book.totalCopies - activeBorrowings;
          const estimatedWaitDays = holdCount > 0 && availableCopies === 0
            ? Math.ceil((holdCount * book.loanPeriodDays) / book.totalCopies)
            : 0;

          return {
            ...book,
            availableCopies,
            totalHolds: holdCount,
            estimatedWaitDays,
            userBorrowing,
            userReservation,
          };
        })
      );

      res.json(booksWithAvailability);
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  // Get book details by ID
  app.get("/api/books/:id", async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const userId = req.user?.id;

      const [book] = await db
        .select({
          id: books.id,
          title: books.title,
          author: books.author,
          description: books.description,
          ageGroup: books.ageGroup,
          imageUrl: books.imageUrl,
          format: books.format,
          totalCopies: books.totalCopies,
          loanPeriodDays: books.loanPeriodDays,
          library: libraries,
        })
        .from(books)
        .leftJoin(libraries, eq(books.libraryId, libraries.id))
        .where(eq(books.id, bookId));

      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      // Get current active borrowings count
      const [{ activeBorrowings }] = await db
        .select({
          activeBorrowings: count(),
        })
        .from(borrowings)
        .where(
          and(
            eq(borrowings.bookId, book.id),
            eq(borrowings.status, 'borrowed')
          )
        );

      // Get hold queue length
      const [{ holdCount }] = await db
        .select({
          holdCount: count(),
        })
        .from(reservations)
        .where(
          and(
            eq(reservations.bookId, book.id),
            eq(reservations.status, 'pending')
          )
        );

      // Get user's current borrowing if any
      let userBorrowing = null;
      if (userId) {
        const [currentBorrowing] = await db
          .select()
          .from(borrowings)
          .where(
            and(
              eq(borrowings.bookId, book.id),
              eq(borrowings.userId, userId),
              eq(borrowings.status, 'borrowed')
            )
          );
        userBorrowing = currentBorrowing;
      }

      // Get user's current reservation if any
      let userReservation = null;
      if (userId) {
        const [currentReservation] = await db
          .select()
          .from(reservations)
          .where(
            and(
              eq(reservations.bookId, book.id),
              eq(reservations.userId, userId),
              eq(reservations.status, 'pending')
            )
          );
        userReservation = currentReservation;
      }

      const availableCopies = book.totalCopies - activeBorrowings;
      // Estimate wait time based on loan period and number of holds
      const estimatedWaitDays = holdCount > 0 && availableCopies === 0
        ? Math.ceil((holdCount * book.loanPeriodDays) / book.totalCopies)
        : 0;

      res.json({
        ...book,
        availableCopies,
        totalHolds: holdCount,
        estimatedWaitDays,
        userBorrowing,
        userReservation,
      });
    } catch (error) {
      console.error('Error fetching book details:', error);
      res.status(500).json({ error: "Failed to fetch book details" });
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
      console.error('Error reserving book:', error);
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
      console.error('Error fetching reserved books:', error);
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
      console.error('Error cancelling reservation:', error);
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
      // Get book details
      const [book] = await db
        .select()
        .from(books)
        .where(eq(books.id, bookId));

      if (!book) {
        console.error(`Book not found with ID: ${bookId}`);
        return res.status(404).json({ error: "Book not found" });
      }

      // Check if user already has this book borrowed
      const [existingBorrowing] = await db
        .select()
        .from(borrowings)
        .where(
          and(
            eq(borrowings.bookId, bookId),
            eq(borrowings.userId, req.user.id),
            eq(borrowings.status, 'borrowed')
          )
        );

      if (existingBorrowing) {
        console.error(`User ${req.user.id} already has book ${bookId} borrowed`);
        return res.status(400).json({ error: "You have already borrowed this book" });
      }

      // Check book availability
      const [{ activeBorrowings }] = await db
        .select({
          activeBorrowings: count(),
        })
        .from(borrowings)
        .where(
          and(
            eq(borrowings.bookId, bookId),
            eq(borrowings.status, 'borrowed')
          )
        );

      if (activeBorrowings >= book.totalCopies) {
        return res.status(400).json({ error: "No copies available. Please join the wait list." });
      }

      // Calculate due date based on loan period
      const dueDate = addDays(new Date(), book.loanPeriodDays);

      // Create new borrowing record
      const [borrowing] = await db
        .insert(borrowings)
        .values({
          userId: req.user.id,
          bookId: bookId,
          status: 'borrowed',
          borrowedAt: new Date(),
          dueDate: dueDate,
        })
        .returning();

      console.log(`Successfully created borrowing record: ${JSON.stringify(borrowing)}`);
      res.json({
        message: "Book borrowed successfully",
        borrowing: {
          ...borrowing,
          dueDate: dueDate.toISOString(),
        },
      });
    } catch (error) {
      console.error('Error borrowing book:', error);
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
          imageUrl: books.imageUrl,
          format: books.format,
          totalCopies: books.totalCopies,
          loanPeriodDays: books.loanPeriodDays,
          borrowedAt: borrowings.borrowedAt,
          dueDate: borrowings.dueDate,
          status: borrowings.status,
          library: libraries
        })
        .from(borrowings)
        .leftJoin(books, eq(borrowings.bookId, books.id))
        .leftJoin(libraries, eq(books.libraryId, libraries.id))
        .where(and(
          eq(borrowings.userId, req.user.id),
          eq(borrowings.status, 'borrowed')
        ));

      res.json(borrowedBooks);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
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
        username: users.email, // Using email as username for now
      })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id));

      res.json(results);
    } catch (error) {
      console.error('Error fetching posts:', error);
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
      console.error('Error creating post:', error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
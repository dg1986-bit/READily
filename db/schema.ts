import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const libraries = pgTable("libraries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  ageGroup: text("age_group").notNull(),
  libraryId: integer("library_id").references(() => libraries.id),
  isbn: text("isbn").unique(),
  language: text("language").default('English'),
  totalCopies: integer("total_copies").notNull().default(1),
  format: text("format").notNull().default('physical'), // physical, ebook, audiobook
  loanPeriodDays: integer("loan_period_days").notNull().default(21),
  categories: text("categories"), // JSON string array of category IDs
  createdAt: timestamp("created_at").defaultNow(),
});

export const borrowings = pgTable("borrowings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  borrowedAt: timestamp("borrowed_at").defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  returnedAt: timestamp("returned_at"),
  renewCount: integer("renew_count").notNull().default(0),
  maxRenewals: integer("max_renewals").notNull().default(2),
  status: text("status").notNull().default('borrowed'), // borrowed, returned, overdue
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  position: integer("position").notNull(),
  status: text("status").notNull().default('pending'), // pending, ready, cancelled, completed
  createdAt: timestamp("created_at").defaultNow(),
  notifiedAt: timestamp("notified_at"),
  expiresAt: timestamp("expires_at"),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations configuration
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  borrowings: many(borrowings),
  reservations: many(reservations),
}));

export const booksRelations = relations(books, ({ many, one }) => ({
  borrowings: many(borrowings),
  reservations: many(reservations),
  library: one(libraries, {
    fields: [books.libraryId],
    references: [libraries.id],
  }),
}));

export const librariesRelations = relations(libraries, ({ many }) => ({
  books: many(books),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertLibrarySchema = createInsertSchema(libraries);
export const selectLibrarySchema = createSelectSchema(libraries);
export const insertBookSchema = createInsertSchema(books);
export const selectBookSchema = createSelectSchema(books);
export const insertReservationSchema = createInsertSchema(reservations);
export const selectReservationSchema = createSelectSchema(reservations);

// Types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type Library = typeof libraries.$inferSelect;
export type Book = typeof books.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Borrowing = typeof borrowings.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;

// Add type for book with library relation and availability info
export interface BookWithLibrary extends Book {
  library: Library | null;
  availableCopies?: number;
  totalHolds?: number;
  estimatedWaitDays?: number;
  userBorrowing?: Borrowing | null;
  userReservation?: Reservation | null;
}
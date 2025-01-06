import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description").notNull(),
  ageGroup: text("age_group").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const borrowings = pgTable("borrowings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  borrowedAt: timestamp("borrowed_at").defaultNow(),
  returnedAt: timestamp("returned_at"),
  status: text("status").notNull().default('borrowed'), // 'borrowed' or 'returned'
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  borrowings: many(borrowings),
}));

export const booksRelations = relations(books, ({ many }) => ({
  borrowings: many(borrowings),
}));

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// Export the types for use in our application
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type Book = typeof books.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Borrowing = typeof borrowings.$inferSelect;

// Add type for user with relation
export interface PostWithUser extends Post {
  user: SelectUser;
}
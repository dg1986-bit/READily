# READily

**A world of children's stories, delivered to your door.**

Built solo by Dearlie Gilbert — product manager, prototyped using Replit's AI-assisted development environment as part of my hands-on exploration of AI-native product building, from concept through a working Proof of Concept.

**Status:** Prototype, not currently live. I relocated to Madrid after building this, so it's not something I'm running as a service, it's proof of work. Screenshots below.

## Screenshots

Home:

![Home screen](./attached_assets/MVP%20home.png)

Login:

![Login](./attached_assets/MVP%20login.png)

Discover:

![Discover](./attached_assets/MVP%20Discover.png)
*The AI-powered book matcher under Discover is a work in progress, being built separately with Claude Code as a hands-on exercise in AI-assisted development.*

My Shelf:

![My Shelf](./attached_assets/MVP%20my%20shelf.png)

Community:

![Community](./attached_assets/MVP%20Community.png)


## Vision

A unified library platform that connects every library in Thailand, letting moms discover, borrow, and return books effortlessly, anytime, anywhere. For kids from newborn to 12 years old, READily pairs a vast collection of age-appropriate books with integrated delivery, smart due-date notifications, and streamlined deposit refunds, making libraries accessible and borrowing stress-free for busy moms.

## The Problem

- No central database consolidating libraries across Thailand
- No reliable book delivery system for libraries in Thailand (as of 2024)
- Due dates and library contact are hard to track. I once traveled across Bangkok to return a book to the Art Library, only to find it closed for the day.

## Edge (vs. library consolidation apps like Libby)

- AI-powered book matcher for age-appropriate recommendations
- Purpose-built for moms and kids' developmental needs, not a general-purpose library app
- Community: moms sharing recommendations and support
- Educational guidance on what's appropriate at each developmental stage, similar to Lovevery for toys
- Two-tier business model: a membership fee for ad-hoc borrowing, and a subscription fee for curated books delivered monthly

## Features

- **Tailored Picks** — age-appropriate, personalized recommendations to guide moms in nurturing their child's development
- **Moms Together** — a space for moms to share recommendations and support each other
- **Easy Borrowing** — integrated library collections, due-date notifications, and delivery
- Age-based categories: 0-2, 3-5, 6-8, 9-12 years
- User authentication and profile management
- Book borrowing and reservation system
- Multi-dimensional filtering by age group, library, and subject

## Tech Stack

- TypeScript full-stack development
- React frontend with Shadcn UI components
- PostgreSQL database with Drizzle ORM
- Express.js backend
- Authentication system

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up database connection
4. Run the development server: `npm run dev`

## Environment Variables

This project requires:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session management

## License

No license, "All Rights Reserved"

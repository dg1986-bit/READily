import { useQuery } from "@tanstack/react-query";
import { BookWithLibrary } from "@db/schema";
import BookCard from "@/components/BookCard";
import { Loader2 } from "lucide-react";

export default function MyShelf() {
  const { data: borrowedBooks, isLoading, refetch } = useQuery<BookWithLibrary[]>({
    queryKey: ['/api/books/borrowed'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">My Shelf</h1>

      {(!borrowedBooks || borrowedBooks.length === 0) ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">You haven't borrowed any books yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {borrowedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onBorrow={async () => {
                await refetch();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import BookCard from "@/components/BookCard";
import { Book, Library } from "@db/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BookDiscovery() {
  const [location] = useLocation();
  const { toast } = useToast();

  // Parse the age parameter from the URL
  const ageGroup = new URLSearchParams(location.split('?')[1]).get('age');

  const { data: libraries } = useQuery<Library[]>({
    queryKey: ['/api/libraries'],
  });

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ['/api/books', ageGroup],
    enabled: true,
  });

  const handleBorrow = async (book: Book) => {
    try {
      const res = await fetch('/api/books/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id }),
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to borrow book');

      toast({
        title: "Success",
        description: "Book has been borrowed successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Discover Books</h1>
        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Libraries" />
          </SelectTrigger>
          <SelectContent>
            {libraries?.map((library) => (
              <SelectItem key={library.id} value={library.id.toString()}>
                {library.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {books?.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onBorrow={handleBorrow}
          />
        ))}
      </div>
    </div>
  );
}
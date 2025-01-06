import { useQuery } from "@tanstack/react-query";
import BookCard from "@/components/BookCard";
import { BookWithLibrary, Library } from "@db/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import DevelopmentalStageInfo from "@/components/DevelopmentalStageInfo";
import { developmentalStages } from "@/lib/developmental-stages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function BookDiscovery() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [selectedLibrary, setSelectedLibrary] = useState<string | undefined>();

  // Parse the age parameter from the URL
  const ageGroup = new URLSearchParams(location.split('?')[1]).get('age');
  const stage = ageGroup ? developmentalStages[ageGroup] : null;

  const { data: libraries } = useQuery<Library[]>({
    queryKey: ['/api/libraries'],
  });

  const { data: books, isLoading } = useQuery<BookWithLibrary[]>({
    queryKey: ['/api/books', { age: ageGroup, libraryId: selectedLibrary }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (ageGroup) params.append('age', ageGroup);
      if (selectedLibrary) params.append('libraryId', selectedLibrary);

      const response = await fetch(`/api/books?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch books');
      return response.json();
    },
  });

  const handleBorrow = async (book: BookWithLibrary) => {
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Discover Books</h1>
        <Select
          value={selectedLibrary}
          onValueChange={(value) => setSelectedLibrary(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Libraries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={undefined}>All Libraries</SelectItem>
            {libraries?.map((library) => (
              <SelectItem key={library.id} value={library.id.toString()}>
                {library.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {stage && (
        <div className="my-8">
          <DevelopmentalStageInfo stage={stage} />
        </div>
      )}

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
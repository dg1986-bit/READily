import { useQuery } from "@tanstack/react-query";
import BookCard from "@/components/BookCard";
import CategoryFilter from "@/components/CategoryFilter";
import { BookWithLibrary } from "@db/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import DevelopmentalStageInfo from "@/components/DevelopmentalStageInfo";
import { developmentalStages } from "@/lib/developmental-stages";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { AlertCircle, Search } from "lucide-react";

export default function BookDiscovery() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Parse the age parameter from the URL
  const ageGroup = new URLSearchParams(location.split('?')[1]).get('age');
  const stage = ageGroup ? developmentalStages[ageGroup] : null;

  const { data: books, isLoading } = useQuery<BookWithLibrary[]>({
    queryKey: ['/api/books', { 
      age: ageGroup, 
      search: searchQuery,
      categories: selectedCategories 
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (ageGroup) params.append('age', ageGroup);
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategories.length > 0) {
        params.append('categories', selectedCategories.join(','));
      }

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
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Discover Books</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search books by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {stage && (
        <div className="my-8">
          <DevelopmentalStageInfo stage={stage} />
        </div>
      )}

      <div className="flex gap-6">
        <CategoryFilter
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
        />

        <div className="flex-1">
          {(!books || books.length === 0) && (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No books found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery
                  ? `No books matching "${searchQuery}"`
                  : `No books available${ageGroup ? ` for ${developmentalStages[ageGroup].ageRange}` : ''}`}
              </p>
            </div>
          )}

          {books && books.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onBorrow={handleBorrow}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
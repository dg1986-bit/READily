import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BookWithLibrary } from "@db/schema";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { developmentalStages } from "@/lib/developmental-stages";

export default function BookDetails() {
  const [location, setLocation] = useLocation();
  const bookId = location.split('/')[2]; // Get book ID from URL

  const { data: book, isLoading } = useQuery<BookWithLibrary>({
    queryKey: ['/api/books', bookId],
    queryFn: async () => {
      const response = await fetch(`/api/books/${bookId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch book details');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Book not found</p>
      </div>
    );
  }

  const stage = developmentalStages[book.ageGroup];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-muted">
          {book.imageUrl ? (
            <img
              src={book.imageUrl}
              alt={`Cover of ${book.title}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground">No cover available</span>
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
            <p className="text-xl text-muted-foreground">by {book.author}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">{book.library?.name}</p>
                <p className="text-sm text-muted-foreground">{book.library?.address}</p>
              </div>
            </div>

            {book.format !== 'physical' && (
              <p className="text-sm capitalize">
                Format: {book.format}
              </p>
            )}

            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <p className="text-sm">
                Loan period: {book.loanPeriodDays} days
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600 leading-relaxed">{book.description}</p>
          </div>

          {stage && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Age Group: {stage.ageRange}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-primary mb-1">Reading Level</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {stage.readingMilestones.slice(0, 2).map((milestone, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{milestone}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-primary mb-1">Book Features</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {stage.recommendedBookTypes.slice(0, 2).map((type, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{type}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {book.availableCopies} of {book.totalCopies} copies available
                </p>
                {book.totalHolds > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {book.totalHolds} {book.totalHolds === 1 ? 'person' : 'people'} waiting
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

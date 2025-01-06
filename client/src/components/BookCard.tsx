import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookWithLibrary } from "@db/schema";
import { ImageOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type BookCardProps = {
  book: BookWithLibrary;
};

export default function BookCard({ book }: BookCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const { toast } = useToast();

  const handleImageLoad = () => {
    console.log(`Image loaded successfully for book: ${book.title}`);
    setIsLoading(false);
  };

  const handleImageError = () => {
    console.error(`Failed to load image for book: ${book.title}, URL: ${book.imageUrl}`);
    setImageError(true);
    setIsLoading(false);
  };

  const handleBorrow = async () => {
    setIsBorrowing(true);
    try {
      const res = await fetch('/api/books/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id }),
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to borrow book');
      }

      toast({
        title: "Success",
        description: `You have successfully borrowed "${book.title}"`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsBorrowing(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="relative aspect-[3/4] rounded-t-lg overflow-hidden bg-muted">
        {book.imageUrl && !imageError ? (
          <img
            src={book.imageUrl}
            alt={`Cover of ${book.title}`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {isLoading && book.imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{book.title}</CardTitle>
        <CardDescription>By {book.author}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-gray-600 line-clamp-3">{book.description}</p>
        <div className="mt-2 space-y-2">
          <span className="text-xs font-medium bg-primary/10 text-primary rounded-full px-2 py-1">
            {book.ageGroup}
          </span>
          {book.library && (
            <p className="text-xs text-gray-500">
              Available at: {book.library.name}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleBorrow}
          disabled={isBorrowing}
        >
          {isBorrowing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Borrowing...
            </>
          ) : (
            "Borrow"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
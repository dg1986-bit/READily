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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookWithLibrary } from "@db/schema";
import { ImageOff, Loader2, Clock, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type BookCardProps = {
  book: BookWithLibrary;
};

export default function BookCard({ book }: BookCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const { toast } = useToast();

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to borrow book');
      }

      toast({
        title: "Success",
        description: `You have borrowed "${book.title}". Due date: ${format(new Date(data.borrowing.dueDate), 'PPP')}`,
      });
    } catch (error: any) {
      console.error('Error borrowing book:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsBorrowing(false);
    }
  };

  const getAvailabilityStatus = () => {
    if (book.userBorrowing) {
      return {
        label: `Due ${format(new Date(book.userBorrowing.dueDate), 'PP')}`,
        color: 'text-blue-600 bg-blue-50',
      };
    }

    if (book.availableCopies && book.availableCopies > 0) {
      return {
        label: 'Available',
        color: 'text-green-600 bg-green-50',
      };
    }

    if (book.totalHolds && book.totalHolds > 0) {
      return {
        label: 'Wait List',
        color: 'text-amber-600 bg-amber-50',
      };
    }

    return {
      label: 'Unavailable',
      color: 'text-red-600 bg-red-50',
    };
  };

  const status = getAvailabilityStatus();

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
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="line-clamp-1">{book.title}</CardTitle>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>
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
          {book.format !== 'physical' && (
            <p className="text-xs text-gray-500 capitalize">
              Format: {book.format}
            </p>
          )}
          {book.totalHolds !== undefined && book.totalHolds > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <span>
                      {book.estimatedWaitDays} day wait
                    </span>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {book.totalHolds} {book.totalHolds === 1 ? 'person' : 'people'} waiting
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleBorrow}
          disabled={isBorrowing || book.availableCopies === 0 || book.userBorrowing !== null}
          variant={book.availableCopies === 0 ? "outline" : "default"}
        >
          {isBorrowing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Borrowing...
            </>
          ) : book.userBorrowing ? (
            "Currently Borrowed"
          ) : book.availableCopies === 0 ? (
            "Join Wait List"
          ) : (
            "Borrow"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
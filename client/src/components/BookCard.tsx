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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookWithLibrary } from "@db/schema";
import { ImageOff, Loader2, Clock, Info, BookOpen, CalendarClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";

type BookCardProps = {
  book: BookWithLibrary;
  onBorrow?: (book: BookWithLibrary) => Promise<void>;
};

export default function BookCard({ book, onBorrow }: BookCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [showBorrowDialog, setShowBorrowDialog] = useState(false);
  const { toast } = useToast();

  const handleImageLoad = () => setIsLoading(false);
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
      if (!res.ok) throw new Error(data.error || 'Failed to borrow book');

      toast({
        title: "Success",
        description: `You have borrowed "${book.title}". Due date: ${format(new Date(data.borrowing.dueDate), 'PPP')}`,
      });

      if (onBorrow) await onBorrow(book);
    } catch (error: any) {
      console.error('Error borrowing book:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsBorrowing(false);
      setShowBorrowDialog(false);
    }
  };

  const handleReserve = async () => {
    setIsReserving(true);
    try {
      const res = await fetch('/api/books/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join wait list');

      toast({
        title: "Success",
        description: `You have been added to the wait list for "${book.title}"`,
      });

      if (onBorrow) await onBorrow(book);
    } catch (error: any) {
      console.error('Error reserving book:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsReserving(false);
    }
  };

  const getBorrowingStatus = () => {
    if (book.userBorrowing) {
      const dueDate = new Date(book.userBorrowing.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const status = daysUntilDue <= 3 ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50';
      return {
        label: `Due ${format(dueDate, 'PP')}`,
        sublabel: daysUntilDue <= 3 ? 'Due soon' : undefined,
        color: status,
      };
    }

    if (book.userReservation) {
      return {
        label: 'On Hold',
        sublabel: 'Waiting in queue',
        color: 'text-purple-600 bg-purple-50',
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
        sublabel: `${book.totalHolds} ${book.totalHolds === 1 ? 'person' : 'people'} waiting`,
        color: 'text-amber-600 bg-amber-50',
      };
    }

    return {
      label: 'Unavailable',
      color: 'text-red-600 bg-red-50',
    };
  };

  const status = getBorrowingStatus();

  return (
    <>
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
            <div className="flex flex-col items-end">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
                {status.label}
              </span>
              {status.sublabel && (
                <span className="text-xs text-muted-foreground mt-1">
                  {status.sublabel}
                </span>
              )}
            </div>
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
          {book.userBorrowing ? (
            <Button
              className="w-full"
              variant="outline"
              disabled={true}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              Due {format(new Date(book.userBorrowing.dueDate), 'PP')}
            </Button>
          ) : book.userReservation ? (
            <Button
              className="w-full"
              variant="outline"
              disabled={true}
            >
              <Clock className="mr-2 h-4 w-4" />
              On Hold
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={() => {
                if (book.availableCopies && book.availableCopies > 0) {
                  setShowBorrowDialog(true);
                } else {
                  handleReserve();
                }
              }}
              disabled={isBorrowing || isReserving}
              variant={book.availableCopies === 0 ? "outline" : "default"}
            >
              {isBorrowing || isReserving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isBorrowing ? "Borrowing..." : "Joining Wait List..."}
                </>
              ) : book.availableCopies === 0 ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Join Wait List
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Borrow
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={showBorrowDialog} onOpenChange={setShowBorrowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Borrow "{book.title}"</DialogTitle>
            <DialogDescription>
              {`This book will be due ${format(addDays(new Date(), book.loanPeriodDays), 'PPP')}. You can renew it up to 2 times if no one is waiting.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBorrowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBorrow} disabled={isBorrowing}>
              {isBorrowing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Borrowing...
                </>
              ) : (
                'Confirm Borrow'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
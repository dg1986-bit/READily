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

type BookCardProps = {
  book: BookWithLibrary;
  onBorrow?: (book: BookWithLibrary) => void;
};

export default function BookCard({ book, onBorrow }: BookCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-1">{book.title}</CardTitle>
        <CardDescription>By {book.author}</CardDescription>
      </CardHeader>
      <CardContent>
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
          onClick={() => onBorrow?.(book)}
        >
          Borrow
        </Button>
      </CardFooter>
    </Card>
  );
}
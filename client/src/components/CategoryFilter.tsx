import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MenuIcon } from "lucide-react";
import { useLocation } from "wouter";

type CategoryItem = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
  items: CategoryItem[];
};

type CategoryFilterProps = {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  currentAgeGroup?: string | null;
};

export default function CategoryFilter({
  selectedCategories,
  onCategoriesChange,
  currentAgeGroup,
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetch('/data/categories.json')
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.error('Error loading categories:', error));
  }, []);

  const handleItemClick = (categoryId: string, itemId: string) => {
    if (categoryId === 'age-group') {
      // For age groups, navigate to the new URL
      setLocation(`/discover?age=${encodeURIComponent(itemId)}`);
    } else {
      // For other categories, toggle selection
      const newSelection = selectedCategories.includes(itemId)
        ? selectedCategories.filter(id => id !== itemId)
        : [...selectedCategories, itemId];
      onCategoriesChange(newSelection);
    }
  };

  const CategoryList = () => (
    <Accordion type="multiple" className="w-full">
      {categories.map((category) => (
        <AccordionItem key={category.id} value={category.id}>
          <AccordionTrigger className="text-sm font-medium">
            {category.name}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pl-4">
              {category.items.map((item) => {
                // For age groups, check against currentAgeGroup
                const isChecked = category.id === 'age-group'
                  ? currentAgeGroup === item.id
                  : selectedCategories.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={item.id}
                      checked={isChecked}
                      onCheckedChange={() => handleItemClick(category.id, item.id)}
                    />
                    <label
                      htmlFor={item.id}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {item.name}
                    </label>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <MenuIcon className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Categories</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
              <CategoryList />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block w-[250px] flex-shrink-0">
        <div className="sticky top-6">
          <h3 className="font-semibold mb-4">Categories</h3>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <CategoryList />
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
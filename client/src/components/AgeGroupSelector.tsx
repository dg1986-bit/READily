import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function AgeGroupSelector() {
  const [, setLocation] = useLocation();

  const ageGroups = [
    { label: "0-2 years", value: "infant" },
    { label: "3-5 years", value: "preschool" },
    { label: "6-8 years", value: "early-reader" },
    { label: "9-12 years", value: "middle-grade" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {ageGroups.map((group) => (
        <Button
          key={group.value}
          variant="outline"
          onClick={() => setLocation(`/discover?age=${group.value}`)}
          className="h-20 text-lg"
        >
          {group.label}
        </Button>
      ))}
    </div>
  );
}
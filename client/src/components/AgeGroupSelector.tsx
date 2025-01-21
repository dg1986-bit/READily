import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function AgeGroupSelector() {
  const [, setLocation] = useLocation();

  const ageGroups = [
    { label: "0-2 years", value: "0-2 years" },
    { label: "3-5 years", value: "3-5 years" },
    { label: "6-8 years", value: "6-8 years" },
    { label: "9-12 years", value: "9-12 years" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {ageGroups.map((group) => (
        <Button
          key={group.value}
          variant="outline"
          onClick={() => setLocation(`/discover?age=${encodeURIComponent(group.value)}`)}
          className="h-20 text-lg"
        >
          {group.label}
        </Button>
      ))}
    </div>
  );
}
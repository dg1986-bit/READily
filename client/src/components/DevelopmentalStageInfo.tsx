import { DevelopmentalStage } from "@/lib/developmental-stages";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DevelopmentalStageInfoProps = {
  stage: DevelopmentalStage;
};

export default function DevelopmentalStageInfo({ stage }: DevelopmentalStageInfoProps) {
  return (
    <Card className="bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <CardHeader>
        <CardTitle>Reading Guide: {stage.ageRange}</CardTitle>
        <CardDescription>
          Understanding your child's developmental stage helps choose the right books
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-primary mb-2">Key Developmental Characteristics</h3>
          <ul className="list-disc list-inside space-y-1">
            {stage.keyCharacteristics.map((char, i) => (
              <li key={i} className="text-sm text-muted-foreground">{char}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold text-primary mb-2">Reading Milestones</h3>
          <ul className="list-disc list-inside space-y-1">
            {stage.readingMilestones.map((milestone, i) => (
              <li key={i} className="text-sm text-muted-foreground">{milestone}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-primary mb-2">Recommended Book Types</h3>
          <ul className="list-disc list-inside space-y-1">
            {stage.recommendedBookTypes.map((type, i) => (
              <li key={i} className="text-sm text-muted-foreground">{type}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

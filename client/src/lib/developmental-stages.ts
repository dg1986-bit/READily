export type DevelopmentalStage = {
  ageGroup: string;
  ageRange: string;
  keyCharacteristics: string[];
  readingMilestones: string[];
  recommendedBookTypes: string[];
};

export const developmentalStages: Record<string, DevelopmentalStage> = {
  infant: {
    ageGroup: "infant",
    ageRange: "0-2 years",
    keyCharacteristics: [
      "Developing sensory awareness",
      "Learning cause and effect",
      "Building language foundations",
      "Increasing attention span"
    ],
    readingMilestones: [
      "Responds to rhythmic language and songs",
      "Points to pictures",
      "Names familiar objects",
      "Shows interest in turning pages"
    ],
    recommendedBookTypes: [
      "Board books with simple images",
      "Touch-and-feel books",
      "Nursery rhyme collections",
      "Simple bedtime stories"
    ]
  },
  preschool: {
    ageGroup: "preschool",
    ageRange: "3-5 years",
    keyCharacteristics: [
      "Developing imagination",
      "Learning emotional regulation",
      "Expanding vocabulary",
      "Understanding basic sequences"
    ],
    readingMilestones: [
      "Recognizes alphabet letters",
      "Understands story structure",
      "Makes predictions about stories",
      "Retells familiar stories"
    ],
    recommendedBookTypes: [
      "Picture books with simple plots",
      "Alphabet and counting books",
      "Books about daily routines",
      "Interactive stories with repetition"
    ]
  },
  "early-reader": {
    ageGroup: "early-reader",
    ageRange: "6-8 years",
    keyCharacteristics: [
      "Beginning to read independently",
      "Developing critical thinking",
      "Understanding complex emotions",
      "Growing attention span"
    ],
    readingMilestones: [
      "Reads simple texts independently",
      "Understands basic plot elements",
      "Uses reading strategies",
      "Shows interest in different genres"
    ],
    recommendedBookTypes: [
      "Early chapter books",
      "Books with short chapters",
      "Series with recurring characters",
      "Non-fiction with simple explanations"
    ]
  },
  "middle-grade": {
    ageGroup: "middle-grade",
    ageRange: "9-12 years",
    keyCharacteristics: [
      "Reading independently",
      "Developing abstract thinking",
      "Understanding complex narratives",
      "Growing social awareness"
    ],
    readingMilestones: [
      "Reads longer texts fluently",
      "Analyzes character motivations",
      "Understands themes and morals",
      "Makes connections between texts"
    ],
    recommendedBookTypes: [
      "Middle-grade novels",
      "Complex chapter books",
      "Non-fiction on specific topics",
      "Books addressing social issues"
    ]
  }
};

export interface CurriculumForm {
  gradeLevel: string;
  subject: string;
  programLengthWeeks: number;
  classesPerWeek: number;
  classDuration: string;
  studentLevel: string;
  whatShouldStudentsLearn: string;
  contentIncorporated: string;
  skillsToDevelop: string;
  lessonStructure: string;
  whatToAvoid: string;
  additionalNotes: string;
}

export interface CurriculumWeek {
  week: number;
  mainFocus: string;
  readingContent: string;
  readingSkills: string;
  writingSkills: string;
  majorActivity: string;
  homeworkAssessment: string;
  suggestedMaterials: string;
}

export interface CurriculumOutput {
  programTitle: string;
  programOverview: string;
  learningGoals: string[];
  skillsProgression: string;
  curriculumMap: CurriculumWeek[];
  revisionHistory?: string[];
  approved?: boolean;
  approvedAt?: string;
}

export interface LessonPlanSection {
  duration?: string;
  description: string;
}

export interface LessonPlan {
  weekNumber: number;
  lessonTitle: string;
  lessonObjectives: string[];
  materials: string[];
  priorKnowledge: string;
  warmUp: LessonPlanSection;
  miniLesson: LessonPlanSection;
  guidedPractice: LessonPlanSection;
  readingActivity: LessonPlanSection;
  discussionQuestions: string[];
  writingActivity: LessonPlanSection;
  independentPractice: LessonPlanSection;
  assessmentExitTicket: string;
  homework: string;
  differentiationSuggestions: {
    strivingLearners: string;
    advancedLearners: string;
  };
  teacherNotes: string;
  revisionNotes?: string[];
  lastModified?: string;
}

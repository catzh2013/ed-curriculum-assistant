import React, { useState, useEffect } from "react";
import type { CurriculumForm, CurriculumOutput, LessonPlan } from "./types.ts";
import { SAMPLE_CURRICULUM_INPUTS } from "./utils/sampleData.ts";
import { Header } from "./components/Header.tsx";
import { CurriculumFormView } from "./components/CurriculumFormView.tsx";
import { CurriculumDisplayView } from "./components/CurriculumDisplayView.tsx";
import { LessonPlannerView } from "./components/LessonPlannerView.tsx";
import { AlertCircle, CheckCircle, X } from "lucide-react";

const INITIAL_FORM: CurriculumForm = {
  gradeLevel: "",
  subject: "",
  programLengthWeeks: 6,
  classesPerWeek: 3,
  classDuration: "60 minutes",
  studentLevel: "",
  whatShouldStudentsLearn: "",
  contentIncorporated: "",
  skillsToDevelop: "",
  lessonStructure: "",
  whatToAvoid: "",
  additionalNotes: "",
};

const STORAGE_KEYS = {
  FORM: "curriculum_assistant_form",
  CURRICULUM: "curriculum_assistant_output",
  LESSONS: "curriculum_assistant_lessons",
  STEP: "curriculum_assistant_step",
};

export default function App() {
  const [form, setForm] = useState<CurriculumForm>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.FORM);
      return saved ? JSON.parse(saved) : SAMPLE_CURRICULUM_INPUTS;
    } catch {
      return SAMPLE_CURRICULUM_INPUTS;
    }
  });

  const [curriculum, setCurriculum] = useState<CurriculumOutput | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.CURRICULUM);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [lessons, setLessons] = useState<Record<number, LessonPlan>>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.LESSONS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeStep, setActiveStep] = useState<"form" | "curriculum" | "lessons">(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.STEP) as "form" | "curriculum" | "lessons";
      if (saved) return saved;
      return "form";
    } catch {
      return "form";
    }
  });

  const [isGeneratingCurriculum, setIsGeneratingCurriculum] = useState(false);
  const [isRevisingCurriculum, setIsRevisingCurriculum] = useState(false);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [generatingWeekNumber, setGeneratingWeekNumber] = useState<number | null>(null);
  const [isRevisingLesson, setIsRevisingLesson] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedAction, setLastFailedAction] = useState<(() => void) | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const formatErrorMessage = (raw: string): string => {
    if (!raw) return "An unexpected error occurred. Please try again.";
    if (
      raw.includes("503") ||
      raw.includes("UNAVAILABLE") ||
      raw.includes("high demand") ||
      raw.includes("Resource has been exhausted")
    ) {
      return "The AI service is currently experiencing a temporary surge in traffic. Please click 'Try Again' to retry your request.";
    }
    if (raw.includes("API key") || raw.includes("GEMINI_API_KEY")) {
      return "API key configuration is required. Please check that GEMINI_API_KEY is set.";
    }
    return raw;
  };

  // Sync to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.FORM, JSON.stringify(form));
    } catch (e) {
      console.error(e);
    }
  }, [form]);

  useEffect(() => {
    try {
      if (curriculum) {
        sessionStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(curriculum));
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.CURRICULUM);
      }
    } catch (e) {
      console.error(e);
    }
  }, [curriculum]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
    } catch (e) {
      console.error(e);
    }
  }, [lessons]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.STEP, activeStep);
    } catch (e) {
      console.error(e);
    }
  }, [activeStep]);

  // Form Field Change
  const handleFormFieldChange = (field: keyof CurriculumForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Apply Sample Preset
  const handleApplyPreset = (preset: CurriculumForm) => {
    setForm(preset);
    setNotification("Template loaded into form fields. You can modify any field before generating.");
  };

  // 1. Generate Curriculum
  const handleGenerateCurriculum = async () => {
    setErrorMessage(null);
    setIsGeneratingCurriculum(true);
    try {
      const response = await fetch("/api/curriculum/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate curriculum.");
      }

      setCurriculum(data);
      setActiveStep("curriculum");
      setNotification("Curriculum draft generated successfully! Review the blueprint and weekly map below.");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(formatErrorMessage(err.message));
      setLastFailedAction(() => () => handleGenerateCurriculum());
    } finally {
      setIsGeneratingCurriculum(false);
    }
  };

  // 2. Revise Curriculum
  const handleReviseCurriculum = async (revisionRequest: string) => {
    if (!curriculum) return;
    setErrorMessage(null);
    setLastFailedAction(null);
    setIsRevisingCurriculum(true);
    try {
      const response = await fetch("/api/curriculum/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curriculum, revisionRequest, form }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to revise curriculum.");
      }

      setCurriculum(data);
      setNotification("Curriculum updated based on your revision instructions.");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(formatErrorMessage(err.message));
      setLastFailedAction(() => () => handleReviseCurriculum(revisionRequest));
    } finally {
      setIsRevisingCurriculum(false);
    }
  };

  // 3. Approve Curriculum
  const handleApproveCurriculum = () => {
    if (!curriculum) return;
    const approvedCurriculum: CurriculumOutput = {
      ...curriculum,
      approved: true,
      approvedAt: new Date().toISOString(),
    };
    setCurriculum(approvedCurriculum);
    setActiveStep("lessons");
    setNotification("Curriculum approved! The weekly lesson generator is now unlocked.");
  };

  // 4. Generate Lesson Plan for a Specific Week
  const handleGenerateLesson = async (weekNumber: number) => {
    if (!curriculum) return;
    const weekData = curriculum.curriculumMap?.find((w) => w.week === weekNumber);
    if (!weekData) return;

    setErrorMessage(null);
    setLastFailedAction(null);
    setIsGeneratingLesson(true);
    setGeneratingWeekNumber(weekNumber);

    try {
      const response = await fetch("/api/lesson/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekNumber,
          weekData,
          curriculum,
          form,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate lesson plan.");
      }

      setLessons((prev) => ({
        ...prev,
        [weekNumber]: data,
      }));
      setNotification(`Week ${weekNumber} lesson plan generated successfully.`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(formatErrorMessage(err.message));
      setLastFailedAction(() => () => handleGenerateLesson(weekNumber));
    } finally {
      setIsGeneratingLesson(false);
      setGeneratingWeekNumber(null);
    }
  };

  // 5. Revise Lesson Plan
  const handleReviseLesson = async (weekNumber: number, directive: string) => {
    const currentLesson = lessons[weekNumber];
    if (!currentLesson || !curriculum) return;

    setErrorMessage(null);
    setLastFailedAction(null);
    setIsRevisingLesson(true);

    try {
      const response = await fetch("/api/lesson/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentLesson,
          revisionRequest: directive,
          curriculum,
          form,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to revise lesson plan.");
      }

      setLessons((prev) => ({
        ...prev,
        [weekNumber]: data,
      }));
      setNotification(`Week ${weekNumber} lesson plan revised successfully.`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(formatErrorMessage(err.message));
      setLastFailedAction(() => () => handleReviseLesson(weekNumber, directive));
    } finally {
      setIsRevisingLesson(false);
    }
  };

  // Reset Session
  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to start a new curriculum? This will clear current session drafts."
      )
    ) {
      setCurriculum(null);
      setLessons({});
      setForm(SAMPLE_CURRICULUM_INPUTS);
      setActiveStep("form");
      sessionStorage.clear();
      setNotification("New session started.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <Header
        activeStep={activeStep}
        onStepClick={(step) => {
          if (step === "lessons" && !curriculum?.approved) return;
          if (step === "curriculum" && !curriculum) return;
          setActiveStep(step);
        }}
        hasCurriculum={!!curriculum}
        isApproved={!!curriculum?.approved}
        onReset={handleReset}
      />

      {/* Notifications & Error Alerts */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full pt-4 print:hidden">
        {errorMessage && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-xs flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <div className="flex items-center space-x-2 shrink-0 ml-3">
              {lastFailedAction && (
                <button
                  onClick={() => {
                    const action = lastFailedAction;
                    setErrorMessage(null);
                    setLastFailedAction(null);
                    action();
                  }}
                  className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded font-medium text-[11px] transition shadow-2xs"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setLastFailedAction(null);
                }}
                className="text-rose-500 hover:text-rose-700 p-1"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {notification && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-emerald-500 hover:text-emerald-700 ml-3"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Views Container */}
      <main className="grow">
        {activeStep === "form" && (
          <CurriculumFormView
            form={form}
            onChange={handleFormFieldChange}
            onApplyPreset={handleApplyPreset}
            onGenerate={handleGenerateCurriculum}
            isGenerating={isGeneratingCurriculum}
          />
        )}

        {activeStep === "curriculum" && curriculum && (
          <CurriculumDisplayView
            curriculum={curriculum}
            form={form}
            onRevise={handleReviseCurriculum}
            isRevising={isRevisingCurriculum}
            onApprove={handleApproveCurriculum}
            onGoToLessons={() => setActiveStep("lessons")}
            onBackToInputs={() => setActiveStep("form")}
          />
        )}

        {activeStep === "lessons" && curriculum && (
          <LessonPlannerView
            curriculum={curriculum}
            form={form}
            lessons={lessons}
            onGenerateLesson={handleGenerateLesson}
            isGeneratingLesson={isGeneratingLesson}
            generatingWeekNumber={generatingWeekNumber}
            onReviseLesson={handleReviseLesson}
            isRevisingLesson={isRevisingLesson}
            onBackToCurriculum={() => setActiveStep("curriculum")}
          />
        )}
      </main>

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-slate-200">
              Curriculum Assistant
            </span>
            <span>•</span>
            <span>Internal Educational Tool</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Designed for K–12 Reading & Writing Curriculum Directors & Master Teachers
          </p>
        </div>
      </footer>
    </div>
  );
}

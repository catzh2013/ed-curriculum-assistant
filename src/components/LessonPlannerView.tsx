import React, { useState } from "react";
import {
  Calendar,
  Clock,
  BookOpen,
  Target,
  FileDown,
  Printer,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Edit3,
  Users,
  BrainCircuit,
  MessageSquare,
  FileText,
  Lightbulb,
  CheckSquare,
  BookmarkCheck,
  ChevronRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import type { CurriculumOutput, CurriculumWeek, LessonPlan, CurriculumForm } from "../types.ts";
import { exportLessonToDoc } from "../utils/exportDoc.ts";

interface LessonPlannerViewProps {
  curriculum: CurriculumOutput;
  form: CurriculumForm;
  lessons: Record<number, LessonPlan>;
  onGenerateLesson: (weekNumber: number) => void;
  isGeneratingLesson: boolean;
  generatingWeekNumber: number | null;
  onReviseLesson: (weekNumber: number, directive: string) => void;
  isRevisingLesson: boolean;
  onBackToCurriculum: () => void;
}

export const LessonPlannerView: React.FC<LessonPlannerViewProps> = ({
  curriculum,
  form,
  lessons,
  onGenerateLesson,
  isGeneratingLesson,
  generatingWeekNumber,
  onReviseLesson,
  isRevisingLesson,
  onBackToCurriculum,
}) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [customRevision, setCustomRevision] = useState<string>("");

  const weeks = curriculum.curriculumMap || [];
  const currentWeekData = weeks.find((w) => w.week === selectedWeek) || weeks[0];
  const currentLesson = currentWeekData ? lessons[currentWeekData.week] : undefined;

  const totalLessonsPlanned = Object.keys(lessons).length;
  const isSelectedWeekGenerating =
    isGeneratingLesson && generatingWeekNumber === currentWeekData?.week;

  const handleCustomRevise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRevision.trim() || !currentWeekData) return;
    onReviseLesson(currentWeekData.week, customRevision.trim());
    setCustomRevision("");
  };

  const handleQuickRevise = (directive: string) => {
    if (!currentWeekData) return;
    onReviseLesson(currentWeekData.week, directive);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Banner / Program Context */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <button
                type="button"
                onClick={onBackToCurriculum}
                className="text-xs text-sky-700 hover:text-sky-900 font-medium inline-flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Curriculum Map</span>
              </button>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {form.gradeLevel} • {form.subject} ({form.classDuration})
              </span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
              Weekly Lesson Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Program: <strong className="text-slate-900">{curriculum.programTitle}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Lesson Progress</div>
              <div className="text-sm font-bold text-slate-900">
                {totalLessonsPlanned} of {weeks.length} Completed
              </div>
            </div>
            <div className="w-16 bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-sky-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(totalLessonsPlanned / Math.max(weeks.length, 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weekly Tabs Selector */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
          {weeks.map((w) => {
            const hasLesson = !!lessons[w.week];
            const isSelected = selectedWeek === w.week;
            const isCurrentGenerating = isGeneratingLesson && generatingWeekNumber === w.week;

            return (
              <button
                key={w.week}
                type="button"
                onClick={() => setSelectedWeek(w.week)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-lg text-xs font-medium shrink-0 transition ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                    isSelected
                      ? "bg-slate-800 text-white"
                      : hasLesson
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {w.week}
                </span>
                <span className="font-semibold">Week {w.week}</span>
                {isCurrentGenerating && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                )}
                {hasLesson && !isCurrentGenerating && (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      isSelected ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Lesson Studio Grid */}
      {currentWeekData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Week Context & Curriculum Map Reminder (4 cols) */}
          <div className="lg:col-span-4 space-y-6 print:hidden">
            {/* Week Blueprint Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="bg-sky-100 text-sky-900 text-xs font-bold px-2.5 py-0.5 rounded">
                  Curriculum Map: Week {currentWeekData.week}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {form.classDuration}
                </span>
              </div>

              <div>
                <h3 className="text-base font-serif font-bold text-slate-900">
                  {currentWeekData.mainFocus}
                </h3>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div>
                  <span className="font-semibold text-slate-900 block mb-0.5">
                    Reading / Content Focus:
                  </span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                    {currentWeekData.readingContent}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-900 block mb-0.5">
                    Reading Skills:
                  </span>
                  <p className="text-slate-600">{currentWeekData.readingSkills}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-900 block mb-0.5">
                    Writing Skills:
                  </span>
                  <p className="text-slate-600">{currentWeekData.writingSkills}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-900 block mb-0.5">
                    Major Activity:
                  </span>
                  <p className="text-slate-600">{currentWeekData.majorActivity}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-900 block mb-0.5">
                    Assessment / HW:
                  </span>
                  <p className="text-slate-600">{currentWeekData.homeworkAssessment}</p>
                </div>

                {currentWeekData.suggestedMaterials && (
                  <div>
                    <span className="font-semibold text-amber-900 block mb-0.5">
                      Suggested Materials:
                    </span>
                    <p className="text-amber-950/80 italic bg-amber-50/50 p-2 rounded border border-amber-100">
                      {currentWeekData.suggestedMaterials}
                    </p>
                  </div>
                )}
              </div>

              {/* Generate / Regenerate Button in Left Card */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onGenerateLesson(currentWeekData.week)}
                  disabled={isGeneratingLesson || isRevisingLesson}
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-xs transition"
                >
                  {isSelectedWeekGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Drafting Week {currentWeekData.week} Lesson...</span>
                    </>
                  ) : currentLesson ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Regenerate Fresh Lesson</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Lesson</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Tips for Director */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
              <div className="font-semibold text-slate-800 flex items-center">
                <Lightbulb className="w-4 h-4 text-amber-500 mr-1.5" />
                Lesson Plan Criteria
              </div>
              <p>
                Nexus lessons are strictly sized for your <strong>{form.classDuration}</strong> duration,
                tailored to <strong>{form.gradeLevel}</strong> learners, and avoid filler tasks.
              </p>
            </div>
          </div>

          {/* Right Column: Detailed Lesson Plan View or Empty State (8 cols) */}
          <div className="lg:col-span-8">
            {!currentLesson ? (
              // Empty state when lesson has not yet been generated for this week
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center shadow-xs">
                <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-700 mx-auto flex items-center justify-center mb-4">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">
                  No Lesson Plan Generated for Week {currentWeekData.week} Yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
                  Generate a complete, classroom-ready lesson plan calibrated for {form.classDuration},
                  featuring explicit modeling, close reading, structured writing, and targeted differentiation.
                </p>

                <button
                  type="button"
                  onClick={() => onGenerateLesson(currentWeekData.week)}
                  disabled={isGeneratingLesson}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-sm transition active:scale-[0.99]"
                >
                  {isSelectedWeekGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Lesson with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Week {currentWeekData.week} Lesson</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              // FULL LESSON PLAN RENDERER
              <div className="space-y-6">
                {/* Lesson Header Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm bg-slate-900 text-white">
                          Week {currentLesson.weekNumber} Lesson
                        </span>
                        <span className="text-xs text-slate-500 font-medium flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {form.classDuration}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight">
                        {currentLesson.lessonTitle}
                      </h2>
                    </div>

                    <div className="flex items-center space-x-2 print:hidden">
                      <button
                        type="button"
                        onClick={() => exportLessonToDoc(currentLesson, curriculum.programTitle)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition"
                        title="Download lesson as Word document"
                      >
                        <FileDown className="w-3.5 h-3.5 text-slate-500" />
                        <span>Word (.doc)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition"
                        title="Print or save as PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>

                  {/* Lesson Objectives */}
                  <div className="mb-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                      <Target className="w-3.5 h-3.5 mr-1.5 text-sky-700" />
                      Lesson Objective(s)
                    </h4>
                    <ul className="space-y-1.5">
                      {(currentLesson.lessonObjectives || []).map((obj, i) => (
                        <li
                          key={i}
                          className="flex items-start text-xs sm:text-sm text-slate-800 bg-sky-50/50 p-2.5 rounded-lg border border-sky-100"
                        >
                          <CheckCircle2 className="w-4 h-4 text-sky-600 mr-2 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-sky-950 font-semibold">SWBAT:</strong> {obj}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Materials & Prior Knowledge */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                      <div className="font-bold text-slate-900 mb-1.5 flex items-center">
                        <FileText className="w-3.5 h-3.5 text-slate-600 mr-1.5" />
                        Materials & Resources
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        {(currentLesson.materials || []).map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                      <div className="font-bold text-slate-900 mb-1.5 flex items-center">
                        <BookmarkCheck className="w-3.5 h-3.5 text-slate-600 mr-1.5" />
                        Prior Knowledge & Connection
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        {currentLesson.priorKnowledge}
                      </p>
                    </div>
                  </div>
                </div>

                {/* INSTRUCTIONAL PROCEDURES & TIMED WORKSHOP SECTIONS */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
                  <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 text-sky-700 mr-2" />
                      Instructional Sequence & Time Allocation
                    </span>
                    <span className="text-xs font-normal text-slate-500">
                      Target: {form.classDuration}
                    </span>
                  </h3>

                  {/* 1. Warm-Up */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                          1
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          Warm-up / Bellringer
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        {currentLesson.warmUp?.duration || "5-10 mins"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {currentLesson.warmUp?.description}
                    </p>
                  </div>

                  {/* 2. Mini-Lesson / Direct Instruction */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                          2
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          Mini-Lesson / Teacher Modeling (I Do)
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        {currentLesson.miniLesson?.duration || "15 mins"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {currentLesson.miniLesson?.description}
                    </p>
                  </div>

                  {/* 3. Guided Practice */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                          3
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          Guided Practice (We Do)
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        {currentLesson.guidedPractice?.duration || "10-15 mins"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {currentLesson.guidedPractice?.description}
                    </p>
                  </div>

                  {/* 4. Reading Activity */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                          4
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          Reading Activity & Close Text Analysis
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        {currentLesson.readingActivity?.duration || "15 mins"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {currentLesson.readingActivity?.description}
                    </p>
                  </div>

                  {/* 5. Discussion Questions */}
                  <div className="border border-indigo-100 rounded-lg p-4 bg-indigo-50/30">
                    <div className="font-bold text-xs uppercase tracking-wider text-indigo-900 mb-2.5 flex items-center">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                      Discussion Questions for Text Inquiries
                    </div>
                    <ol className="space-y-2 list-decimal pl-4 text-xs sm:text-sm text-indigo-950/90">
                      {(currentLesson.discussionQuestions || []).map((q, i) => (
                        <li key={i} className="pl-1">
                          {q}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* 6. Writing Activity */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                          5
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          Writing Activity (Application & Craft)
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        {currentLesson.writingActivity?.duration || "15-20 mins"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {currentLesson.writingActivity?.description}
                    </p>
                  </div>

                  {/* 7. Independent Practice */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                          6
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          Independent Practice (You Do)
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                        {currentLesson.independentPractice?.duration || "15 mins"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {currentLesson.independentPractice?.description}
                    </p>
                  </div>
                </div>

                {/* ASSESSMENT & HOMEWORK */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Assessment / Exit Ticket */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                      Assessment / Exit Ticket
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {currentLesson.assessmentExitTicket}
                    </p>
                  </div>

                  {/* Homework */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                      <FileText className="w-3.5 h-3.5 text-slate-600 mr-1.5" />
                      Homework / Extension
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {currentLesson.homework}
                    </p>
                  </div>
                </div>

                {/* DIFFERENTIATION & TEACHER NOTES */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
                      <BrainCircuit className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                      Differentiation Strategies
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                      <div className="bg-sky-50/50 border border-sky-100 p-3.5 rounded-lg">
                        <span className="font-bold text-sky-950 block mb-1">
                          Scaffolding for Striving Learners:
                        </span>
                        <p className="text-slate-700 leading-relaxed">
                          {currentLesson.differentiationSuggestions?.strivingLearners}
                        </p>
                      </div>

                      <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-lg">
                        <span className="font-bold text-emerald-950 block mb-1">
                          Extensions for Advanced Learners:
                        </span>
                        <p className="text-slate-700 leading-relaxed">
                          {currentLesson.differentiationSuggestions?.advancedLearners}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
                      Teacher Notes & Pacing Tips
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 italic bg-amber-50/30 p-3.5 rounded-lg border border-amber-100 leading-relaxed">
                      {currentLesson.teacherNotes}
                    </p>
                  </div>
                </div>

                {/* LESSON REVISION SECTION */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs print:hidden">
                  <div className="flex items-center space-x-2 mb-2">
                    <RefreshCw className="w-4 h-4 text-sky-700" />
                    <h3 className="text-base font-bold text-slate-900">
                      Revise Week {currentLesson.weekNumber} Lesson
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">
                    Modify this specific lesson plan without losing context. Use the quick revision prompts or enter your custom guidance below.
                  </p>

                  {/* Preset Revision Buttons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      type="button"
                      disabled={isRevisingLesson}
                      onClick={() => handleQuickRevise("Make the lesson more challenging with higher-level analytical synthesis, rigorous text inquiry, and deeper evaluation questions.")}
                      className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-md transition border border-slate-200"
                    >
                      Make More Challenging
                    </button>
                    <button
                      type="button"
                      disabled={isRevisingLesson}
                      onClick={() => handleQuickRevise("Add more writing time and structured drafting with sentence frames and paragraph modeling.")}
                      className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-md transition border border-slate-200"
                    >
                      Add More Writing
                    </button>
                    <button
                      type="button"
                      disabled={isRevisingLesson}
                      onClick={() => handleQuickRevise("Add more student discussion, Socratic questioning, and collaborative peer talk structures.")}
                      className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-md transition border border-slate-200"
                    >
                      Add More Discussion
                    </button>
                    <button
                      type="button"
                      disabled={isRevisingLesson}
                      onClick={() => handleQuickRevise("Make the lesson more engaging with an interactive hook, creative prompt, and active student-centered inquiry.")}
                      className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-md transition border border-slate-200"
                    >
                      Make More Engaging
                    </button>
                  </div>

                  {/* Custom Revision Input Form */}
                  <form onSubmit={handleCustomRevise} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        What would you like to change?
                      </label>
                      <textarea
                        rows={2}
                        value={customRevision}
                        onChange={(e) => setCustomRevision(e.target.value)}
                        placeholder="e.g. Please replace the warm-up with a visual prompt, shorten the mini-lesson to 10 minutes, and provide a scaffolded paragraph template..."
                        className="w-full text-sm rounded-lg border border-slate-300 p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isRevisingLesson || !customRevision.trim()}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-xs transition"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRevisingLesson ? "animate-spin" : ""}`} />
                        <span>{isRevisingLesson ? "Revising Lesson..." : "Revise Lesson"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

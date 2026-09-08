import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  FileDown,
  Printer,
  RefreshCw,
  Edit3,
  Calendar,
  Layers,
  Target,
  BookOpen,
  ArrowRight,
  Lightbulb,
  Clock,
  History,
  Info,
} from "lucide-react";
import type { CurriculumOutput, CurriculumForm } from "../types.ts";
import { exportCurriculumToDoc } from "../utils/exportDoc.ts";

interface CurriculumDisplayViewProps {
  curriculum: CurriculumOutput;
  form: CurriculumForm;
  onRevise: (revisionRequest: string) => void;
  isRevising: boolean;
  onApprove: () => void;
  onGoToLessons: () => void;
  onBackToInputs: () => void;
}

export const CurriculumDisplayView: React.FC<CurriculumDisplayViewProps> = ({
  curriculum,
  form,
  onRevise,
  isRevising,
  onApprove,
  onGoToLessons,
  onBackToInputs,
}) => {
  const [revisionText, setRevisionText] = useState("");

  const handleRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionText.trim() || isRevising) return;
    onRevise(revisionText.trim());
    setRevisionText("");
  };

  const handleQuickChip = (suggestion: string) => {
    setRevisionText((prev) => (prev ? `${prev}; ${suggestion}` : suggestion));
  };

  const handlePrint = () => {
    window.print();
  };

  const isApproved = !!curriculum.approved;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Banner / Status & Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5 print:border-none print:pb-0 print:mb-2">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm bg-slate-100 text-slate-700">
                {form.gradeLevel || "K-12"} • {form.subject || "Reading & Writing"}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {form.programLengthWeeks} Weeks • {form.classesPerWeek} Classes/Wk ({form.classDuration})
              </span>
              {isApproved ? (
                <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Approved Blueprint</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Draft for Review</span>
                </span>
              )}
            </div>

            {/* 1. Program Title */}
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              {curriculum.programTitle}
            </h1>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <button
              type="button"
              onClick={() => exportCurriculumToDoc(curriculum)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition"
              title="Download as clean formatted Microsoft Word document"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Word (.doc)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / PDF</span>
            </button>

            {isApproved ? (
              <button
                type="button"
                onClick={onGoToLessons}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition"
              >
                <span>Generate Weekly Lessons</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onApprove}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 shadow-xs transition"
              >
                <CheckCircle2 className="w-4 h-4 text-sky-200" />
                <span>Approve Curriculum</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Program Overview */}
        <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
            <BookOpen className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Program Overview
          </h2>
          <p className="whitespace-pre-line text-slate-800 bg-slate-50/60 p-4 rounded-lg border border-slate-200/60">
            {curriculum.programOverview}
          </p>
        </div>

        {/* 3. Learning Goals & 4. Skills Progression */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
          {/* 3. Learning Goals */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
              <Target className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Learning Goals
            </h2>
            <ul className="space-y-2">
              {(curriculum.learningGoals || []).map((goal, idx) => (
                <li
                  key={idx}
                  className="flex items-start text-xs sm:text-sm text-slate-800 bg-white border border-slate-200/80 rounded-lg p-3 shadow-2xs"
                >
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold flex items-center justify-center mr-2.5 shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Skills Progression */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Skills Progression & Scaffolding
            </h2>
            <div className="bg-sky-50/40 border border-sky-100 rounded-lg p-4 text-xs sm:text-sm text-slate-800 leading-relaxed">
              <p className="whitespace-pre-line">{curriculum.skillsProgression}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Curriculum Map */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-sky-700" />
              Curriculum Map ({curriculum.curriculumMap?.length || 0} Weeks)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Organized sequential progression building skills logically each week.
            </p>
          </div>

          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Suggested readings are recommendations, not mandates.</span>
          </div>
        </div>

        {/* Detailed Week Cards */}
        <div className="space-y-4">
          {(curriculum.curriculumMap || []).map((weekData) => (
            <div
              key={weekData.week}
              className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition shadow-2xs"
            >
              {/* Card Header */}
              <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded">
                    Week {weekData.week}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {weekData.mainFocus}
                  </h3>
                </div>

                {isApproved && (
                  <button
                    type="button"
                    onClick={onGoToLessons}
                    className="self-start sm:self-auto text-xs font-medium text-sky-700 hover:text-sky-900 inline-flex items-center space-x-1 hover:underline print:hidden"
                  >
                    <span>View Lesson</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Card Grid Content */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-slate-700">
                {/* Reading & Content */}
                <div className="bg-white p-3 rounded-lg border border-slate-100">
                  <div className="font-semibold text-slate-900 mb-1 flex items-center">
                    <BookOpen className="w-3.5 h-3.5 text-sky-600 mr-1.5" />
                    Reading & Content Focus
                  </div>
                  <p className="text-slate-700 leading-normal">{weekData.readingContent}</p>
                </div>

                {/* Reading Skills */}
                <div className="bg-white p-3 rounded-lg border border-slate-100">
                  <div className="font-semibold text-slate-900 mb-1 flex items-center">
                    <Target className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                    Target Reading Skills
                  </div>
                  <p className="text-slate-700 leading-normal">{weekData.readingSkills}</p>
                </div>

                {/* Writing Skills */}
                <div className="bg-white p-3 rounded-lg border border-slate-100">
                  <div className="font-semibold text-slate-900 mb-1 flex items-center">
                    <Edit3 className="w-3.5 h-3.5 text-teal-600 mr-1.5" />
                    Target Writing Skills
                  </div>
                  <p className="text-slate-700 leading-normal">{weekData.writingSkills}</p>
                </div>

                {/* Major Activity / Project */}
                <div className="bg-white p-3 rounded-lg border border-slate-100">
                  <div className="font-semibold text-slate-900 mb-1 flex items-center">
                    <Layers className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
                    Major Activity / Project
                  </div>
                  <p className="text-slate-700 leading-normal">{weekData.majorActivity}</p>
                </div>

                {/* Homework / Assessment */}
                <div className="bg-white p-3 rounded-lg border border-slate-100">
                  <div className="font-semibold text-slate-900 mb-1 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                    Homework / Assessment
                  </div>
                  <p className="text-slate-700 leading-normal">{weekData.homeworkAssessment}</p>
                </div>

                {/* Suggested Materials */}
                <div className="bg-amber-50/30 p-3 rounded-lg border border-amber-100">
                  <div className="font-semibold text-amber-900 mb-1 flex items-center">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
                    Suggested Materials
                    <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                      Suggestion
                    </span>
                  </div>
                  <p className="text-amber-950/80 leading-normal italic">
                    {weekData.suggestedMaterials}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REVISION SECTION */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs print:hidden">
        <div className="flex items-center space-x-2 mb-2">
          <RefreshCw className="w-4 h-4 text-sky-700" />
          <h2 className="text-base font-bold text-slate-900">
            Revise Curriculum
          </h2>
          {curriculum.revisionHistory && curriculum.revisionHistory.length > 0 && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium flex items-center space-x-1">
              <History className="w-3 h-3" />
              <span>{curriculum.revisionHistory.length} revisions made</span>
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Nexus allows iterative revision. Describe changes you want to see—such as adjusting the pace, changing text suggestions, tightening skill scaffolding, or reorienting themes.
        </p>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-[11px] font-semibold text-slate-400 self-center mr-1">
            Quick adjustments:
          </span>
          <button
            type="button"
            onClick={() => handleQuickChip("Emphasize more explicit textual evidence citation")}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded transition"
          >
            + More Textual Evidence
          </button>
          <button
            type="button"
            onClick={() => handleQuickChip("Shift focus in Weeks 2-3 to non-fiction / historical primary sources")}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded transition"
          >
            + Non-fiction Sources
          </button>
          <button
            type="button"
            onClick={() => handleQuickChip("Scaffold the final writing project into smaller weekly check-ins")}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded transition"
          >
            + Scaffold Writing Milestones
          </button>
          <button
            type="button"
            onClick={() => handleQuickChip("Incorporate more structured Socratic seminar or peer debate")}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded transition"
          >
            + Socratic Seminars
          </button>
        </div>

        {/* Revision Form */}
        <form onSubmit={handleRevisionSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              What would you like to change?
            </label>
            <textarea
              rows={3}
              required
              value={revisionText}
              onChange={(e) => setRevisionText(e.target.value)}
              placeholder="e.g. Please increase the focus on narrative voice in Week 2, make Week 4 include a peer editing workshop, and suggest alternative contemporary short stories..."
              className="w-full text-sm rounded-lg border border-slate-300 p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onBackToInputs}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              ← Edit original form inputs
            </button>

            <button
              type="submit"
              disabled={isRevising || !revisionText.trim()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-xs transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRevising ? "animate-spin" : ""}`} />
              <span>{isRevising ? "Revising Curriculum..." : "Revise Curriculum"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* APPROVAL BANNER */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 print:hidden">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-sky-950 text-sky-300 border border-sky-800/80 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Ready for Next Phase</span>
          </div>
          <h3 className="text-lg font-serif font-bold text-white">
            {isApproved ? "Curriculum Approved & Saved" : "Approve Curriculum & Unlock Lesson Planning"}
          </h3>
          <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
            {isApproved
              ? "This curriculum is locked into your active session. You can now generate full, classroom-ready lesson plans for every week."
              : "Approving saves this curriculum draft in your browser session and opens the lesson-generation studio for all weekly modules."}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {isApproved ? (
            <button
              type="button"
              onClick={onGoToLessons}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
            >
              <span>Go to Weekly Lessons</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onApprove}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Curriculum</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

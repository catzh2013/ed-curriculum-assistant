import React from "react";
import { BookOpen, Sparkles, CheckCircle2, RotateCcw, FileText, Calendar } from "lucide-react";

interface HeaderProps {
  activeStep: "form" | "curriculum" | "lessons";
  onStepClick: (step: "form" | "curriculum" | "lessons") => void;
  hasCurriculum: boolean;
  isApproved: boolean;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeStep,
  onStepClick,
  hasCurriculum,
  isApproved,
  onReset,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Institute Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold shadow-sm">
              <BookOpen className="w-5 h-5 text-sky-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-lg text-slate-100 tracking-tight">
                  Nexus Curriculum Assistant
                </span>
                <span className="bg-sky-950 text-sky-300 border border-sky-800/80 text-[11px] font-medium px-2 py-0.5 rounded">
                  Nexus Institute
                </span>
              </div>
              <p className="text-xs text-slate-400">
                K–12 Reading & Writing Program Design
              </p>
            </div>
          </div>

          {/* Workflow Stepper */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onStepClick("form")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeStep === "form"
                  ? "bg-slate-800 text-white shadow-inner"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Curriculum Inputs</span>
            </button>

            <span className="text-slate-600 text-xs">/</span>

            <button
              onClick={() => hasCurriculum && onStepClick("curriculum")}
              disabled={!hasCurriculum}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                !hasCurriculum
                  ? "opacity-40 cursor-not-allowed text-slate-500"
                  : activeStep === "curriculum"
                  ? "bg-slate-800 text-white shadow-inner"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>2. Curriculum Blueprint</span>
              {hasCurriculum && !isApproved && (
                <span className="w-2 h-2 rounded-full bg-amber-400 ml-1" title="Draft" />
              )}
              {isApproved && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />
              )}
            </button>

            <span className="text-slate-600 text-xs">/</span>

            <button
              onClick={() => isApproved && onStepClick("lessons")}
              disabled={!isApproved}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                !isApproved
                  ? "opacity-40 cursor-not-allowed text-slate-500"
                  : activeStep === "lessons"
                  ? "bg-slate-800 text-white shadow-inner"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>3. Weekly Lessons</span>
              {isApproved && (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800/70 text-[10px] px-1.5 py-0.2 rounded font-semibold ml-1">
                  Active
                </span>
              )}
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {hasCurriculum && (
              <button
                onClick={onReset}
                title="Start a new curriculum session"
                className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-1.5 rounded transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Curriculum</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

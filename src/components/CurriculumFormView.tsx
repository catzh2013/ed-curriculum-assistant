import React from "react";
import { Sparkles, Wand2, Lightbulb, HelpCircle, Loader2 } from "lucide-react";
import type { CurriculumForm } from "../types.ts";
import { SAMPLE_CURRICULUM_INPUTS, SAMPLE_ELEMENTARY_INPUTS } from "../utils/sampleData.ts";

interface CurriculumFormViewProps {
  form: CurriculumForm;
  onChange: (field: keyof CurriculumForm, value: any) => void;
  onApplyPreset: (preset: CurriculumForm) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const CurriculumFormView: React.FC<CurriculumFormViewProps> = ({
  form,
  onChange,
  onApplyPreset,
  onGenerate,
  isGenerating,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Introduction Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Curriculum Drafting Studio</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
              Create Reading & Writing Curriculum
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Describe your desired instructional goals, themes, and lesson structure.
              Nexus will formulate a coherent, sequentially scaffolded multi-week curriculum map and weekly lesson plans.
            </p>
          </div>

          {/* Quick presets for the director */}
          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Quick Templates
            </span>
            <button
              type="button"
              onClick={() => onApplyPreset(SAMPLE_CURRICULUM_INPUTS)}
              className="text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 px-3 py-1.5 rounded-md transition text-left"
            >
              7th Grade Argumentative (6 Wks)
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset(SAMPLE_ELEMENTARY_INPUTS)}
              className="text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md transition text-left"
            >
              4th Grade Narrative (4 Wks)
            </button>
          </div>
        </div>

        {/* Note on methodology */}
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-lg p-3.5 text-xs text-amber-900 flex items-start space-x-2.5">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Flexible Institutional Framework:</span> Nexus Institute adapts to your specific goals and preferences rather than imposing a rigid predetermined methodology. Every input below directly shapes the curriculum draft.
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onGenerate();
        }}
        className="space-y-8"
      >
        {/* SECTION 1: Structural & Administrative Parameters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold mr-2">
              1
            </span>
            Program Structure & Target Cohort
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Grade Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                1. Grade Level <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.gradeLevel}
                onChange={(e) => onChange("gradeLevel", e.target.value)}
                placeholder="e.g. 7th Grade, 4th Grade, 9th-10th Grade"
                className="w-full text-sm rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>

            {/* 2. Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                2. Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => onChange("subject", e.target.value)}
                placeholder="e.g. Reading Analysis & Argumentative Writing, ELA"
                className="w-full text-sm rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>

            {/* 3. Program Length in Weeks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                3. Program Length (Weeks) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min={2}
                  max={16}
                  required
                  value={form.programLengthWeeks}
                  onChange={(e) => onChange("programLengthWeeks", parseInt(e.target.value) || 6)}
                  className="w-24 text-sm rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />
                <span className="text-xs text-slate-500">
                  (Typical: 4, 6, 8, or 10 weeks)
                </span>
              </div>
            </div>

            {/* 4. Classes Per Week */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                4. Classes Per Week <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min={1}
                  max={7}
                  required
                  value={form.classesPerWeek}
                  onChange={(e) => onChange("classesPerWeek", parseInt(e.target.value) || 3)}
                  className="w-24 text-sm rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />
                <span className="text-xs text-slate-500">
                  sessions per week
                </span>
              </div>
            </div>

            {/* 5. Class Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                5. Class Duration <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.classDuration}
                onChange={(e) => onChange("classDuration", e.target.value)}
                placeholder="e.g. 60 minutes, 45 minutes, 90-minute block"
                className="w-full text-sm rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>

            {/* 6. Student Level / Ability */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                6. Student Level / Ability <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.studentLevel}
                onChange={(e) => onChange("studentLevel", e.target.value)}
                placeholder="e.g. On grade level, Mixed ability with striving writers, Honors"
                className="w-full text-sm rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Pedagogical & Content Goals */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold mr-2">
              2
            </span>
            Instructional Intent & Content Desiderata
          </h2>

          <div className="space-y-5">
            {/* 7. What should students learn? */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                7. What should students learn? <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Describe the key understanding, concepts, or end-of-program student outcomes.
              </p>
              <textarea
                required
                rows={3}
                value={form.whatShouldStudentsLearn}
                onChange={(e) => onChange("whatShouldStudentsLearn", e.target.value)}
                placeholder="e.g. How to closely read texts to uncover author purpose, synthesize arguments across paired sources, and construct structured multi-paragraph analytical essays with cited textual evidence..."
                className="w-full text-sm rounded-lg border border-slate-300 p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>

            {/* 8. Content, books, authors, themes, topics */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                8. What content, books, authors, themes, or topics should be incorporated?
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Specify any anchor texts or genres. Note: Suggestions will be labeled as suggestions unless you request specific mandatory texts.
              </p>
              <textarea
                rows={3}
                value={form.contentIncorporated}
                onChange={(e) => onChange("contentIncorporated", e.target.value)}
                placeholder="e.g. Dystopian short stories, themes of individual rights vs. conformity, paired with contemporary articles on technological privacy and youth leadership..."
                className="w-full text-sm rounded-lg border border-slate-300 p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>

            {/* 9. Skills to develop */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                9. What skills should students develop?
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Target reading comprehension skills and writing techniques to scaffold across weeks.
              </p>
              <textarea
                rows={3}
                value={form.skillsToDevelop}
                onChange={(e) => onChange("skillsToDevelop", e.target.value)}
                placeholder="e.g. Reading: Identifying subtext, authorial tone, evaluating evidence strength. Writing: Claim generation, embedding quotes with transitions, CER (Claim, Evidence, Reasoning) paragraph structure..."
                className="w-full text-sm rounded-lg border border-slate-300 p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Classroom Methodology & Guardrails */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold mr-2">
              3
            </span>
            Lesson Architecture & Instructional Guardrails
          </h2>

          <div className="space-y-5">
            {/* 10. What should each lesson generally include? */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                10. What should each lesson generally include?
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Your preferred lesson rhythm, pedagogical flow, or standard sections.
              </p>
              <textarea
                rows={3}
                value={form.lessonStructure}
                onChange={(e) => onChange("lessonStructure", e.target.value)}
                placeholder="e.g. 5-min quickwrite hook, 15-min direct modeling with anchor text, 15-min guided partner reading or text interrogation, 20-min student writing practice, 5-min exit ticket..."
                className="w-full text-sm rounded-lg border border-slate-300 p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>

            {/* 11. What should teachers avoid? */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                11. What should teachers avoid?
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Practices, filler activities, or styles that do not align with your educational standards.
              </p>
              <textarea
                rows={2}
                value={form.whatToAvoid}
                onChange={(e) => onChange("whatToAvoid", e.target.value)}
                placeholder="e.g. Avoid passive lecturing for more than 15 minutes, avoid isolated grammar drill sheets without contextual writing application, avoid trivial low-level comprehension questions..."
                className="w-full text-sm rounded-lg border border-slate-300 p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>

            {/* 12. Additional notes or ideas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                12. Additional notes or ideas
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Any specific rubrics, grouping strategies, cultural considerations, or preferences.
              </p>
              <textarea
                rows={2}
                value={form.additionalNotes}
                onChange={(e) => onChange("additionalNotes", e.target.value)}
                placeholder="e.g. Include graphic organizer suggestions for visual learners. Ensure final week incorporates a student exhibition or peer review symposium."
                className="w-full text-sm rounded-lg border border-slate-300 p-3 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Form Submission Action */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Ready to Formulate Curriculum Draft?
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Will generate a {form.programLengthWeeks}-week blueprint with learning goals, skills progression, and organized weekly map.
            </p>
          </div>

          <button
            type="submit"
            disabled={isGenerating || !form.gradeLevel || !form.subject}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-sm transition active:scale-[0.99]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Formulating Curriculum Draft...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Curriculum</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

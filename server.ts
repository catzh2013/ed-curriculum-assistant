import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import type { CurriculumForm, CurriculumOutput, LessonPlan } from "./src/types.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please ensure your API key is provided.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Resilient generation with automatic retry & fallback models for 503/429 high demand spikes
const TEXT_MODELS = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];

interface ResilientGenerateOptions {
  contents: string;
  systemInstruction?: string;
  responseSchema?: any;
  temperature?: number;
}

async function generateContentResilient(
  ai: GoogleGenAI,
  options: ResilientGenerateOptions
): Promise<string> {
  let lastError: any = null;

  for (const model of TEXT_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: {
            systemInstruction: options.systemInstruction,
            temperature: options.temperature ?? 0.7,
            responseMimeType: "application/json",
            responseSchema: options.responseSchema,
          },
        });

        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const isHighDemand =
          msg.includes("503") ||
          msg.includes("429") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("high demand") ||
          msg.includes("Resource has been exhausted");

        console.warn(`[Gemini API - ${model} attempt ${attempt}]:`, msg);

        if (isHighDemand && attempt === 1) {
          // Wait 1.5 seconds before retrying the same model
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }

        // If it's high demand on this model after 2 attempts, try next fallback model
        if (isHighDemand) {
          break;
        }

        // If it's a fatal validation/auth error, throw immediately
        throw err;
      }
    }
  }

  const isOverloaded =
    lastError?.message?.includes("503") ||
    lastError?.message?.includes("high demand") ||
    lastError?.message?.includes("UNAVAILABLE");

  if (isOverloaded) {
    throw new Error(
      "The Gemini model is currently experiencing temporary high demand. Please try again in a few moments."
    );
  }

  throw lastError || new Error("Failed to generate content.");
}


// Curriculum generation schema
const curriculumSchema = {
  type: Type.OBJECT,
  properties: {
    programTitle: {
      type: Type.STRING,
      description: "A cohesive, professional title for this reading/writing program.",
    },
    programOverview: {
      type: Type.STRING,
      description: "A comprehensive 2-3 paragraph overview of the program's pedagogical rationale, themes, and design.",
    },
    learningGoals: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Key overarching learning goals for students across the multi-week program.",
    },
    skillsProgression: {
      type: Type.STRING,
      description: "Explanation of how reading and writing skills scaffold and build logically from week to week.",
    },
    curriculumMap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          week: { type: Type.INTEGER },
          mainFocus: { type: Type.STRING, description: "Main thematic or conceptual focus for the week" },
          readingContent: { type: Type.STRING, description: "Text excerpts, genres, or thematic reading passages" },
          readingSkills: { type: Type.STRING, description: "Specific reading comprehension / analysis skills target" },
          writingSkills: { type: Type.STRING, description: "Specific writing technique, craft, or drafting skill" },
          majorActivity: { type: Type.STRING, description: "Major hands-on activity, workshop, or project for this week" },
          homeworkAssessment: { type: Type.STRING, description: "Weekly assessment check, exit product, or homework" },
          suggestedMaterials: {
            type: Type.STRING,
            description: "Suggested texts or materials (clearly labeled as recommendations/suggestions, without mandating unrequested specific books)",
          },
        },
        required: [
          "week",
          "mainFocus",
          "readingContent",
          "readingSkills",
          "writingSkills",
          "majorActivity",
          "homeworkAssessment",
          "suggestedMaterials",
        ],
      },
      description: "Week-by-week organized curriculum map.",
    },
  },
  required: [
    "programTitle",
    "programOverview",
    "learningGoals",
    "skillsProgression",
    "curriculumMap",
  ],
};

// Lesson plan schema
const lessonPlanSchema = {
  type: Type.OBJECT,
  properties: {
    weekNumber: { type: Type.INTEGER },
    lessonTitle: { type: Type.STRING },
    lessonObjectives: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Measurable, student-centered objectives (SWBAT).",
    },
    materials: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Texts, graphic organizers, writing prompts, handouts needed.",
    },
    priorKnowledge: {
      type: Type.STRING,
      description: "Connection to prior lessons, foundational knowledge required, or bridging concepts.",
    },
    warmUp: {
      type: Type.OBJECT,
      properties: {
        duration: { type: Type.STRING, description: "e.g. 7-10 mins" },
        description: { type: Type.STRING, description: "Engaging hook or bellringer activating schema" },
      },
      required: ["duration", "description"],
    },
    miniLesson: {
      type: Type.OBJECT,
      properties: {
        duration: { type: Type.STRING, description: "e.g. 15 mins" },
        description: { type: Type.STRING, description: "Explicit direct instruction / teacher modeling (I Do)" },
      },
      required: ["duration", "description"],
    },
    guidedPractice: {
      type: Type.OBJECT,
      properties: {
        duration: { type: Type.STRING, description: "e.g. 10-15 mins" },
        description: { type: Type.STRING, description: "Collaborative or teacher-facilitated practice (We Do)" },
      },
      required: ["duration", "description"],
    },
    readingActivity: {
      type: Type.OBJECT,
      properties: {
        duration: { type: Type.STRING, description: "e.g. 15 mins" },
        description: { type: Type.STRING, description: "Close reading, text analysis, annotation, or passage exploration" },
      },
      required: ["duration", "description"],
    },
    discussionQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "High-order thinking discussion questions for Socratic dialogue or partner talks.",
    },
    writingActivity: {
      type: Type.OBJECT,
      properties: {
        duration: { type: Type.STRING, description: "e.g. 15-20 mins" },
        description: { type: Type.STRING, description: "Structured drafting, sentence expansion, or analytical paragraph writing" },
      },
      required: ["duration", "description"],
    },
    independentPractice: {
      type: Type.OBJECT,
      properties: {
        duration: { type: Type.STRING, description: "e.g. 15 mins" },
        description: { type: Type.STRING, description: "Individual student execution applying target skills (You Do)" },
      },
      required: ["duration", "description"],
    },
    assessmentExitTicket: {
      type: Type.STRING,
      description: "Formative assessment check or exit ticket evaluating objective mastery.",
    },
    homework: {
      type: Type.STRING,
      description: "Meaningful extension or reading task for home.",
    },
    differentiationSuggestions: {
      type: Type.OBJECT,
      properties: {
        strivingLearners: { type: Type.STRING, description: "Scaffolding, sentence frames, graphic organizers, small-group support" },
        advancedLearners: { type: Type.STRING, description: "Extension tasks, deeper synthesis, higher-level analytical prompts" },
      },
      required: ["strivingLearners", "advancedLearners"],
    },
    teacherNotes: {
      type: Type.STRING,
      description: "Pacing guidance, potential pitfalls to avoid, classroom management tips, and pedagogical insights.",
    },
  },
  required: [
    "weekNumber",
    "lessonTitle",
    "lessonObjectives",
    "materials",
    "priorKnowledge",
    "warmUp",
    "miniLesson",
    "guidedPractice",
    "readingActivity",
    "discussionQuestions",
    "writingActivity",
    "independentPractice",
    "assessmentExitTicket",
    "homework",
    "differentiationSuggestions",
    "teacherNotes",
  ],
};

// API Route: Generate Curriculum
app.post("/api/curriculum/generate", async (req, res) => {
  try {
    const form: CurriculumForm = req.body;
    if (!form || !form.gradeLevel || !form.subject) {
      return res.status(400).json({ error: "Missing required curriculum inputs (grade level and subject are required)." });
    }

    const ai = getAiClient();

    const systemInstruction = `You are an expert curriculum designer assisting the curriculum director at Nexus Institute, an educational institute running K-12 reading and writing programs.

CRITICAL GUIDELINES:
1. Nexus does NOT yet have a finalized curriculum methodology. Do NOT pretend one exists. Use the curriculum director's specific inputs plus sound educational principles to build a strong, tailored draft.
2. The curriculum map must contain exactly ${form.programLengthWeeks || 6} weeks.
3. Logical progression: Skills must build sequentially on one another rather than being disconnected weekly topics.
4. Do NOT invent specific books or resources as required unless explicitly requested in the prompt. Clearly label any suggested texts as suggestions/recommendations.
5. The curriculum must be specifically calibrated for Grade: "${form.gradeLevel}", Subject: "${form.subject}", Student Ability: "${form.studentLevel}", Classes per week: ${form.classesPerWeek}, Class duration: "${form.classDuration}".
6. Strictly adhere to the curriculum director's specifications on what each lesson should include and what teachers should avoid.`;

    const userPrompt = `Please design a coherent ${form.programLengthWeeks}-week reading and writing curriculum draft based on the following input from the Nexus Institute Curriculum Director:

- Grade Level: ${form.gradeLevel}
- Subject: ${form.subject}
- Program Length: ${form.programLengthWeeks} weeks
- Classes Per Week: ${form.classesPerWeek}
- Class Duration: ${form.classDuration}
- Student Level / Ability: ${form.studentLevel}

DIRECTOR'S PRIORITIES & PREFERENCES:
- What should students learn:
${form.whatShouldStudentsLearn || "Not specified - provide rigorous grade-appropriate reading and writing outcomes."}

- Content, books, authors, themes, or topics to incorporate:
${form.contentIncorporated || "Flexible / open - provide high-quality thematic suggestions."}

- Skills students should develop:
${form.skillsToDevelop || "Core analytical reading, textual evidence citation, and structured expository/persuasive writing skills."}

- What each lesson should generally include:
${form.lessonStructure || "Active warm-up, explicit skill modeling, guided text inquiry, writing application, and closing reflection."}

- What teachers should avoid:
${form.whatToAvoid || "Passive lecturing, isolated grammar drills without context, superficial comprehension questions."}

- Additional notes or ideas:
${form.additionalNotes || "None."}

Generate a comprehensive, logically sequenced curriculum with Title, Overview, Learning Goals, Skills Progression, and a complete ${form.programLengthWeeks}-Week Curriculum Map.`;

    const text = await generateContentResilient(ai, {
      contents: userPrompt,
      systemInstruction,
      temperature: 0.7,
      responseSchema: curriculumSchema,
    });

    const parsed: CurriculumOutput = JSON.parse(text || "{}");
    parsed.approved = false;
    res.json(parsed);
  } catch (error: any) {
    console.error("Error generating curriculum:", error);
    res.status(500).json({ error: error.message || "Failed to generate curriculum." });
  }
});

// API Route: Revise Curriculum
app.post("/api/curriculum/revise", async (req, res) => {
  try {
    const { curriculum, revisionRequest, form } = req.body;
    if (!curriculum || !revisionRequest) {
      return res.status(400).json({ error: "Curriculum and revision request are required." });
    }

    const ai = getAiClient();

    const systemInstruction = `You are an expert curriculum designer assisting the curriculum director at Nexus Institute.
You are revising an existing curriculum draft based on the director's specific feedback.
Preserve the existing strengths and structure while directly and thoroughly addressing the requested modifications.
Maintain sound pedagogical progression and ensure the curriculum map matches the desired week count (${curriculum.curriculumMap?.length || 6} weeks).
Label any book suggestions clearly as suggestions.`;

    const prompt = `Here is the current curriculum draft:
${JSON.stringify(curriculum, null, 2)}

ORIGINAL PROGRAM PARAMETERS:
- Grade Level: ${form?.gradeLevel || "As stated in draft"}
- Subject: ${form?.subject || "As stated in draft"}
- Student Level: ${form?.studentLevel || "As stated in draft"}
- Class Duration: ${form?.classDuration || "As stated in draft"}

THE CURRICULUM DIRECTOR'S REVISION REQUEST:
"${revisionRequest}"

Please produce the revised curriculum adhering to this feedback while keeping the logical skill progression intact.`;

    const text = await generateContentResilient(ai, {
      contents: prompt,
      systemInstruction,
      temperature: 0.7,
      responseSchema: curriculumSchema,
    });

    const revised: CurriculumOutput = JSON.parse(text || "{}");
    revised.revisionHistory = [
      ...(curriculum.revisionHistory || []),
      revisionRequest,
    ];
    revised.approved = false;
    res.json(revised);
  } catch (error: any) {
    console.error("Error revising curriculum:", error);
    res.status(500).json({ error: error.message || "Failed to revise curriculum." });
  }
});

// API Route: Generate Lesson Plan
app.post("/api/lesson/generate", async (req, res) => {
  try {
    const { weekNumber, weekData, curriculum, form } = req.body;
    if (!weekNumber || !curriculum) {
      return res.status(400).json({ error: "Week number and curriculum context are required." });
    }

    const ai = getAiClient();

    const classDuration = form?.classDuration || "60 minutes";
    const gradeLevel = form?.gradeLevel || "Grade Level";
    const studentLevel = form?.studentLevel || "Mixed Ability";

    const systemInstruction = `You are an expert master teacher and curriculum specialist for Nexus Institute.
You are generating a complete, classroom-ready lesson plan for Week ${weekNumber} of the approved curriculum "${curriculum.programTitle}".

CRITICAL REQUIREMENTS:
1. The lesson plan MUST fit the specified class duration of ${classDuration}. Ensure the timed sections (Warm-up, Mini-lesson, Guided practice, Reading, Writing, Independent practice) add up realistically to ${classDuration}.
2. The lesson must be strictly appropriate for Grade ${gradeLevel} and student level: ${studentLevel}.
3. AVOID GENERIC FILLER ACTIVITIES. Every activity must directly build the targeted reading and writing skills.
4. Avoid whatever the director specified to avoid: "${form?.whatToAvoid || 'passive lecturing, unguided worksheets'}".
5. Follow the director's lesson structure guidance: "${form?.lessonStructure || 'warm-up, modeling, guided practice, active reading, writing application, closing reflection'}".
6. Incorporate specific, practical differentiation for striving learners and advanced learners.`;

    const prompt = `Generate a detailed lesson plan for Week ${weekNumber}.

PROGRAM CONTEXT:
- Program Title: ${curriculum.programTitle}
- Program Overview: ${curriculum.programOverview}
- Target Grade: ${gradeLevel}
- Subject: ${form?.subject || "Reading and Writing"}
- Class Duration: ${classDuration}
- Student Ability: ${studentLevel}

WEEK ${weekNumber} CURRICULUM MAP SPECIFICATION:
- Main Focus: ${weekData?.mainFocus}
- Reading Content: ${weekData?.readingContent}
- Reading Skills: ${weekData?.readingSkills}
- Writing Skills: ${weekData?.writingSkills}
- Major Activity / Project: ${weekData?.majorActivity}
- Homework / Assessment: ${weekData?.homeworkAssessment}
- Suggested Materials: ${weekData?.suggestedMaterials}

Create a fully developed, detailed lesson plan that provides concrete, actionable teacher modeling prompts, close reading questions, clear writing prompts, and tailored differentiation.`;

    const text = await generateContentResilient(ai, {
      contents: prompt,
      systemInstruction,
      temperature: 0.7,
      responseSchema: lessonPlanSchema,
    });

    const parsed: LessonPlan = JSON.parse(text || "{}");
    parsed.weekNumber = weekNumber;
    parsed.lastModified = new Date().toISOString();
    res.json(parsed);
  } catch (error: any) {
    console.error("Error generating lesson plan:", error);
    res.status(500).json({ error: error.message || "Failed to generate lesson plan." });
  }
});

// API Route: Revise Lesson Plan
app.post("/api/lesson/revise", async (req, res) => {
  try {
    const { currentLesson, revisionRequest, curriculum, form } = req.body;
    if (!currentLesson || !revisionRequest) {
      return res.status(400).json({ error: "Current lesson and revision request are required." });
    }

    const ai = getAiClient();

    const classDuration = form?.classDuration || "60 minutes";
    const gradeLevel = form?.gradeLevel || "Grade Level";

    const systemInstruction = `You are an expert master teacher and curriculum specialist for Nexus Institute.
You are revising an existing lesson plan for Week ${currentLesson.weekNumber} of "${curriculum?.programTitle || 'Curriculum'}".
Target class duration: ${classDuration}, Grade: ${gradeLevel}.

CRITICAL: Revise the current lesson plan specifically according to the user's revision instruction. Do NOT generate an unrelated lesson plan. Keep the core alignment with Week ${currentLesson.weekNumber}, but alter the activities, depth, pacing, questions, or writing tasks as requested.`;

    const prompt = `Here is the current lesson plan:
${JSON.stringify(currentLesson, null, 2)}

THE CURRICULUM DIRECTOR'S REVISION DIRECTIVE:
"${revisionRequest}"

Please produce the revised lesson plan updating all appropriate fields while maintaining continuity and fit for ${classDuration}.`;

    const text = await generateContentResilient(ai, {
      contents: prompt,
      systemInstruction,
      temperature: 0.7,
      responseSchema: lessonPlanSchema,
    });

    const revised: LessonPlan = JSON.parse(text || "{}");
    revised.weekNumber = currentLesson.weekNumber;
    revised.revisionNotes = [
      ...(currentLesson.revisionNotes || []),
      revisionRequest,
    ];
    revised.lastModified = new Date().toISOString();
    res.json(revised);
  } catch (error: any) {
    console.error("Error revising lesson plan:", error);
    res.status(500).json({ error: error.message || "Failed to revise lesson plan." });
  }
});

// Vite middleware or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus Curriculum Assistant server running on port ${PORT}`);
  });
}

startServer();

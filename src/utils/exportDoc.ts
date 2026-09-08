import type { CurriculumOutput, LessonPlan } from "../types.ts";

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const docWordStyles = `
  <style>
    @page {
      margin: 1.0in;
      size: 8.5in 11.0in;
    }
    body {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a202c;
    }
    h1 {
      font-size: 20pt;
      color: #0f2d4a;
      margin-bottom: 6pt;
      border-bottom: 2pt solid #0f2d4a;
      padding-bottom: 4pt;
    }
    h2 {
      font-size: 15pt;
      color: #1a4971;
      margin-top: 14pt;
      margin-bottom: 6pt;
      border-bottom: 1pt solid #cbd5e1;
      padding-bottom: 3pt;
    }
    h3 {
      font-size: 12pt;
      color: #2b3b4c;
      margin-top: 10pt;
      margin-bottom: 4pt;
    }
    p {
      margin-top: 0;
      margin-bottom: 8pt;
    }
    ul, ol {
      margin-top: 0;
      margin-bottom: 8pt;
      padding-left: 20pt;
    }
    li {
      margin-bottom: 3pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8pt;
      margin-bottom: 14pt;
    }
    th, td {
      border: 1pt solid #cbd5e1;
      padding: 6pt 8pt;
      text-align: left;
      vertical-align: top;
      font-size: 10pt;
    }
    th {
      background-color: #f1f5f9;
      color: #0f2d4a;
      font-weight: bold;
    }
    .badge {
      display: inline-block;
      padding: 2pt 6pt;
      font-size: 9pt;
      font-weight: bold;
      background-color: #e2e8f0;
      border-radius: 3pt;
      margin-bottom: 4pt;
    }
    .callout {
      background-color: #f8fafc;
      border-left: 3pt solid #0f2d4a;
      padding: 8pt 12pt;
      margin: 10pt 0;
    }
    .footer {
      font-size: 9pt;
      color: #64748b;
      margin-top: 20pt;
      border-top: 1pt solid #e2e8f0;
      padding-top: 8pt;
    }
  </style>
`;

export function exportCurriculumToDoc(curriculum: CurriculumOutput) {
  const sanitize = (text?: string) => (text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const rows = (curriculum.curriculumMap || [])
    .map(
      (w) => `
      <tr>
        <td style="font-weight:bold; width: 60px;">Week ${w.week}</td>
        <td><strong>${sanitize(w.mainFocus)}</strong></td>
        <td>${sanitize(w.readingContent)}</td>
        <td>${sanitize(w.readingSkills)}</td>
        <td>${sanitize(w.writingSkills)}</td>
        <td>${sanitize(w.majorActivity)}</td>
        <td>${sanitize(w.homeworkAssessment)}</td>
        <td style="font-style:italic; color:#475569;">${sanitize(w.suggestedMaterials)}</td>
      </tr>
    `
    )
    .join("");

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${sanitize(curriculum.programTitle)}</title>
      ${docWordStyles}
    </head>
    <body>
      <div class="badge">NEXUS INSTITUTE • CURRICULUM BLUEPRINT</div>
      <h1>${sanitize(curriculum.programTitle)}</h1>

      <h2>Program Overview</h2>
      <p>${sanitize(curriculum.programOverview).replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>

      <h2>Learning Goals</h2>
      <ul>
        ${(curriculum.learningGoals || []).map((g) => `<li>${sanitize(g)}</li>`).join("")}
      </ul>

      <h2>Skills Progression & Scaffolding</h2>
      <div class="callout">
        <p>${sanitize(curriculum.skillsProgression).replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>
      </div>

      <h2>Curriculum Map</h2>
      <table>
        <thead>
          <tr>
            <th>Week</th>
            <th>Main Focus</th>
            <th>Reading / Content</th>
            <th>Reading Skills</th>
            <th>Writing Skills</th>
            <th>Major Activity</th>
            <th>Assessment / HW</th>
            <th>Suggested Materials</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="footer">
        Generated with Nexus Curriculum Assistant • Nexus Institute Reading & Writing Programs
      </div>
    </body>
    </html>
  `;

  const fileName = `${curriculum.programTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_curriculum.doc`;
  downloadFile(fileName, html, "application/msword;charset=utf-8");
}

export function exportLessonToDoc(lesson: LessonPlan, programTitle?: string) {
  const sanitize = (text?: string) => (text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${sanitize(lesson.lessonTitle)}</title>
      ${docWordStyles}
    </head>
    <body>
      <div class="badge">NEXUS INSTITUTE • WEEK ${lesson.weekNumber} LESSON PLAN</div>
      <h1>${sanitize(lesson.lessonTitle)}</h1>
      ${programTitle ? `<p style="color:#475569; font-weight: bold;">Program: ${sanitize(programTitle)}</p>` : ""}

      <h2>Lesson Objectives</h2>
      <ul>
        ${(lesson.lessonObjectives || []).map((obj) => `<li><strong>SWBAT:</strong> ${sanitize(obj)}</li>`).join("")}
      </ul>

      <h2>Materials & Resources</h2>
      <ul>
        ${(lesson.materials || []).map((m) => `<li>${sanitize(m)}</li>`).join("")}
      </ul>

      <h2>Prior Knowledge & Connection</h2>
      <p>${sanitize(lesson.priorKnowledge).replace(/\n/g, "<br/>")}</p>

      <h2>Lesson Execution & Pacing</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 140px;">Component</th>
            <th style="width: 80px;">Time</th>
            <th>Instructional Procedure & Student Activity</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Warm-Up / Hook</strong></td>
            <td>${sanitize(lesson.warmUp?.duration || "5-10m")}</td>
            <td>${sanitize(lesson.warmUp?.description || "").replace(/\n/g, "<br/>")}</td>
          </tr>
          <tr>
            <td><strong>Mini-Lesson (Teacher Modeling)</strong></td>
            <td>${sanitize(lesson.miniLesson?.duration || "15m")}</td>
            <td>${sanitize(lesson.miniLesson?.description || "").replace(/\n/g, "<br/>")}</td>
          </tr>
          <tr>
            <td><strong>Guided Practice</strong></td>
            <td>${sanitize(lesson.guidedPractice?.duration || "10-15m")}</td>
            <td>${sanitize(lesson.guidedPractice?.description || "").replace(/\n/g, "<br/>")}</td>
          </tr>
          <tr>
            <td><strong>Reading Activity</strong></td>
            <td>${sanitize(lesson.readingActivity?.duration || "15m")}</td>
            <td>${sanitize(lesson.readingActivity?.description || "").replace(/\n/g, "<br/>")}</td>
          </tr>
          <tr>
            <td><strong>Writing Activity</strong></td>
            <td>${sanitize(lesson.writingActivity?.duration || "15-20m")}</td>
            <td>${sanitize(lesson.writingActivity?.description || "").replace(/\n/g, "<br/>")}</td>
          </tr>
          <tr>
            <td><strong>Independent Practice</strong></td>
            <td>${sanitize(lesson.independentPractice?.duration || "15m")}</td>
            <td>${sanitize(lesson.independentPractice?.description || "").replace(/\n/g, "<br/>")}</td>
          </tr>
        </tbody>
      </table>

      <h2>Discussion Questions</h2>
      <ol>
        ${(lesson.discussionQuestions || []).map((q) => `<li>${sanitize(q)}</li>`).join("")}
      </ol>

      <h2>Assessment & Exit Ticket</h2>
      <div class="callout">
        <p>${sanitize(lesson.assessmentExitTicket).replace(/\n/g, "<br/>")}</p>
      </div>

      <h2>Homework / Extension</h2>
      <p>${sanitize(lesson.homework).replace(/\n/g, "<br/>")}</p>

      <h2>Differentiation Strategies</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 50%;">Scaffolding for Striving Learners</th>
            <th style="width: 50%;">Extensions for Advanced Learners</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${sanitize(lesson.differentiationSuggestions?.strivingLearners || "").replace(/\n/g, "<br/>")}</td>
            <td>${sanitize(lesson.differentiationSuggestions?.advancedLearners || "").replace(/\n/g, "<br/>")}</td>
          </tr>
        </tbody>
      </table>

      <h2>Teacher Notes & Pacing Tips</h2>
      <p style="font-style: italic;">${sanitize(lesson.teacherNotes).replace(/\n/g, "<br/>")}</p>

      <div class="footer">
        Generated with Nexus Curriculum Assistant • Nexus Institute Reading & Writing Programs
      </div>
    </body>
    </html>
  `;

  const fileName = `week_${lesson.weekNumber}_${lesson.lessonTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.doc`;
  downloadFile(fileName, html, "application/msword;charset=utf-8");
}

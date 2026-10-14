import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK according to guidelines
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn('GEMINI_API_KEY is not set in environment. Mock AI fallbacks will be used.');
}

/**
 * Route: Summarize Class Attendance Data
 */
app.post('/api/ai/summarize-attendance', async (req, res) => {
  try {
    const { date, className, stats, absentStudents, totalStudents } = req.body;

    if (!ai) {
      // Graceful realistic fallback if API key is pending
      const pct = Math.round((stats.present / (totalStudents || 1)) * 100);
      return res.json({
        summary: `On ${date}, ${className} recorded an attendance rate of ${pct}% with ${stats.present} of ${totalStudents} students present. ${stats.absent} student(s) were absent and ${stats.late || 0} arrived late.`,
        observations: [
          `${stats.present} students attended today (${pct}% attendance rate).`,
          stats.absent > 0
            ? `${stats.absent} student(s) absent: ${absentStudents.map((s: any) => s.name).join(', ')}.`
            : 'Outstanding 100% attendance recorded today!',
          stats.late > 0 ? `${stats.late} student(s) arrived with delays; monitor arrival times.` : 'No tardiness reported today.',
        ],
        actionItems: [
          'Follow up with parents of unexcused absences before midday.',
          'Verify doctor notes or parent excuses upon student return.',
          'Acknowledge students who maintained perfect attendance this week.',
        ],
      });
    }

    const prompt = `You are an expert school administrative assistant and educational data analyst.
Analyze the following daily student attendance report and provide:
1. A concise, professional summary (2-3 sentences) suitable for daily teacher logs.
2. 3 key observations highlighting attendance rate, patterns, and any critical absentee alerts.
3. 2-3 concrete actionable next steps for the teacher or school admin.

Data:
- Date: ${date}
- Class: ${className}
- Total Enrolled: ${totalStudents}
- Present: ${stats.present} (${Math.round((stats.present / totalStudents) * 100)}%)
- Absent: ${stats.absent}
- Late: ${stats.late || 0}
- Excused: ${stats.excused || 0}
- Absent Students Details: ${JSON.stringify(absentStudents)}

Respond in valid JSON format with keys:
"summary": string,
"observations": string[],
"actionItems": string[]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating attendance summary:', error);
    return res.status(500).json({
      error: 'Failed to generate AI summary',
      details: error.message || 'Unknown error',
    });
  }
});

/**
 * Route: Generate Automated Parent Notification Email / SMS
 */
app.post('/api/ai/generate-parent-alert', async (req, res) => {
  try {
    const {
      studentName,
      rollNo,
      parentName,
      date,
      status, // 'absent' | 'late'
      reason,
      consecutiveDaysAbsent,
      teacherName,
      className,
      tone = 'caring', // 'caring' | 'formal' | 'urgent'
    } = req.body;

    if (!ai) {
      // Clean fallback if API key is not configured
      const isAbsent = status === 'absent';
      const subject = isAbsent
        ? `Attendance Notice: ${studentName} was absent on ${date}`
        : `Tardy Notice: ${studentName} marked late on ${date}`;
      const emailBody = `Dear ${parentName || 'Parent/Guardian'},

This is a courtesy notice from ${className} regarding ${studentName} (Roll #${rollNo}).
We missed ${studentName} in class today, ${date}. Our records indicate that they were marked ${status.toUpperCase()}${reason ? ` (Reason: ${reason})` : ''}.

${consecutiveDaysAbsent > 1 ? `Please note that this is day ${consecutiveDaysAbsent} of consecutive absences. ` : ''}Consistent attendance is vital to staying on track with class activities and lessons. Please reply to this email or contact the school office to confirm their absence reason or discuss any support needed.

Warm regards,
${teacherName || 'The Attendance Office'}
${className}`;

      const smsBody = `Attendance alert: ${studentName} was marked ${status} on ${date}. Please reply or call school office to confirm. Thank you.`;

      return res.json({
        subject,
        emailBody,
        smsBody,
        followUpTip: 'Log parent responses promptly in the student profile notes.',
      });
    }

    const prompt = `You are a school communications assistant helping teachers write professional, empathetic, and clear attendance notices to parents.
Draft an attendance notification for:
- Student Name: ${studentName}
- Roll Number: ${rollNo}
- Parent/Guardian Name: ${parentName || 'Parent/Guardian'}
- Date of Attendance: ${date}
- Status: ${status}
- Recorded Reason / Note: ${reason || 'No reason provided yet'}
- Consecutive Days Absent: ${consecutiveDaysAbsent || 1}
- Class/Grade: ${className}
- Teacher / Sign-off: ${teacherName || 'Classroom Teacher'}
- Requested Tone: ${tone} (e.g. "caring", "formal", or "urgent" if chronic)

Generate a JSON response with:
1. "subject": A clear, professional email subject line.
2. "emailBody": A well-structured, compassionate, yet accountable email text with proper salutation, body paragraphs, and polite sign-off.
3. "smsBody": A concise SMS text under 150 characters for urgent mobile notification.
4. "followUpTip": A 1-sentence tip for the teacher when speaking with this parent.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating parent alert:', error);
    return res.status(500).json({
      error: 'Failed to generate parent alert',
      details: error.message || 'Unknown error',
    });
  }
});

/**
 * Route: AI Student Attendance Pattern Insights
 */
app.post('/api/ai/analyze-student-patterns', async (req, res) => {
  try {
    const { studentName, attendanceHistory, notes } = req.body;

    if (!ai) {
      return res.json({
        insights: `${studentName} maintains an active record. Periodic check-ins are recommended to maintain engagement.`,
        pattern: 'Regular attendance with minor occasional absences.',
        recommendedIntervention: 'Continue routine positive reinforcement.',
      });
    }

    const prompt = `You are a school student counselor and attendance specialist.
Analyze this student's recent attendance pattern:
Student: ${studentName}
Attendance records: ${JSON.stringify(attendanceHistory)}
Teacher notes: ${JSON.stringify(notes)}

Provide a JSON object with:
"insights": 2-3 sentences evaluating overall pattern,
"pattern": identification of any specific trend (e.g. "Cluster around Mondays/Fridays", "Consecutive illness absence", "Punctuality issues", or "Exemplary high commitment"),
"recommendedIntervention": 1-2 practical suggestions for the teacher or counselor.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing student patterns:', error);
    return res.status(500).json({
      error: 'Failed to analyze pattern',
      details: error.message || 'Unknown error',
    });
  }
});

// Vite middleware configuration for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built static assets
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();

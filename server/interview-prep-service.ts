import Groq from "groq-sdk";
import type { User, Job } from "@shared/schema";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Generate interview practice questions tailored to a specific job
 */
export async function generateInterviewQuestions(user: User, job: Job) {
  const prompt = `You are an expert interview coach. Generate practice interview questions for this job application:

JOB:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Required Skills: ${job.skills?.join(", ") || "General"}

CANDIDATE PROFILE:
Skills: ${user.skills?.join(", ") || "Not provided"}
Preferred Role: ${user.preferredJobTitle || "Not specified"}

Generate a comprehensive interview prep guide with:

1. **Behavioral Questions** (5 questions)
   - STAR method questions relevant to this role
   
2. **Technical Questions** (5 questions)
   - Role-specific technical questions based on required skills
   
3. **Company/Culture Fit** (3 questions)
   - Questions about why you want to work at ${job.company}
   
4. **Questions to Ask Interviewer** (5 questions)
   - Smart questions that show your interest and research

For each question, provide:
- The question
- Why it's important
- Key points to cover in your answer (bullet points)

Return as JSON:
{
  "behavioral": [
    {"question": "...", "why": "...", "keyPoints": ["...", "..."]},
    ...
  ],
  "technical": [...],
  "cultureFit": [...],
  "questionsToAsk": [
    {"question": "...", "why": "..."},
    ...
  ]
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_tokens: 3000,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseText;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating interview questions:", error);
    throw error;
  }
}

/**
 * Generate personalized answer suggestions for a specific interview question
 */
export async function generateAnswerSuggestion(
  question: string,
  user: User,
  job: Job
) {
  const prompt = `Help the candidate prepare an answer for this interview question:

QUESTION: "${question}"

JOB CONTEXT:
Title: ${job.title}
Company: ${job.company}

CANDIDATE BACKGROUND:
Skills: ${user.skills?.join(", ") || "General skills"}
Experience: ${user.resumeText?.substring(0, 300) || "Not provided"}

Provide:
1. A structured answer outline using STAR method (Situation, Task, Action, Result)
2. 3-4 key points to emphasize
3. Common mistakes to avoid
4. Tips for delivery

Format as JSON:
{
  "starOutline": {
    "situation": "...",
    "task": "...",
    "action": "...",
    "result": "..."
  },
  "keyPoints": ["...", "..."],
  "mistakesToAvoid": ["...", "..."],
  "deliveryTips": ["...", "..."]
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseText;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating answer suggestion:", error);
    throw error;
  }
}

/**
 * Analyze user's practice answer and provide feedback
 */
export async function analyzeInterviewAnswer(
  question: string,
  userAnswer: string,
  job: Job
) {
  const prompt = `You are an interview coach. Analyze this practice interview answer:

QUESTION: "${question}"

CANDIDATE'S ANSWER:
"${userAnswer}"

JOB CONTEXT: ${job.title} at ${job.company}

Provide constructive feedback:

1. **Strengths** (2-3 points)
   - What they did well
   
2. **Areas for Improvement** (2-3 points)
   - Specific suggestions to strengthen the answer
   
3. **Score** (1-10)
   - Overall rating with brief justification
   
4. **Improved Version** 
   - A better version of their answer (2-3 sentences)

Return as JSON:
{
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "score": 7,
  "scoreJustification": "...",
  "improvedVersion": "..."
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 1200,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseText;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error analyzing interview answer:", error);
    throw error;
  }
}

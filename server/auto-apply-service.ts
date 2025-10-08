import Groq from "groq-sdk";
import type { User, Job } from "@shared/schema";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Generate application data for external ATS forms
 * This helps users auto-fill job applications on external sites
 */
export async function generateApplicationData(user: User, job: Job) {
  const prompt = `You are an expert job application assistant. Generate professional application form data for the following:

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}

APPLICANT PROFILE:
Name: ${user.name || "Not provided"}
Email: ${user.email}
Phone: ${user.phone || "Not provided"}
Location: ${user.location || "Not provided"}
Skills: ${user.skills?.join(", ") || "Not provided"}
Resume Summary: ${user.resumeText?.substring(0, 500) || "Not provided"}

Generate a JSON object with common application form fields filled out professionally. Include:
1. Personal details (name, email, phone, address)
2. Work authorization (assume authorized to work in South Africa)
3. Availability (immediate or 2 weeks notice)
4. Salary expectation (based on user preference: ${user.preferredSalary || "Market rate"})
5. Why you're interested (2-3 sentences tailored to this role)
6. Key qualifications (3-5 bullet points matching job requirements)

Return ONLY valid JSON, no markdown or explanations.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseText;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating application data:", error);
    throw error;
  }
}

/**
 * Generate step-by-step instructions for applying to a job on an external site
 */
export async function generateApplicationInstructions(job: Job, applicationUrl: string) {
  const prompt = `Generate clear, step-by-step instructions for applying to this job:

Job: ${job.title} at ${job.company}
Application URL: ${applicationUrl}

Provide:
1. Brief overview of the application process
2. Step-by-step instructions (numbered)
3. Tips for standing out
4. Common pitfalls to avoid

Keep it concise and actionable. Return plain text, not JSON.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 800,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error generating instructions:", error);
    throw error;
  }
}

/**
 * Analyze job posting and extract ATS-friendly keywords
 */
export async function extractATSKeywords(jobDescription: string) {
  const prompt = `Analyze this job description and extract ATS (Applicant Tracking System) keywords that candidates should include in their application:

${jobDescription}

Return a JSON object with:
{
  "mustHaveKeywords": ["keyword1", "keyword2", ...], // 5-8 critical keywords
  "niceToHaveKeywords": ["keyword3", "keyword4", ...], // 5-8 beneficial keywords
  "skillsToHighlight": ["skill1", "skill2", ...] // Top 5 skills to emphasize
}

Return ONLY valid JSON.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseText;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error extracting ATS keywords:", error);
    throw error;
  }
}

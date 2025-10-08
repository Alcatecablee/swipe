import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface UserProfile {
  name?: string;
  email: string;
  location?: string;
  nqfLevel?: number;
  skills?: string[];
  languages?: string[];
  experience?: Array<{
    role: string;
    company: string;
    duration: string;
  }>;
}

interface JobDetails {
  title: string;
  company: string;
  description: string;
  skills: string[];
  location: string;
  salary: string;
  sector?: string;
  nqfLevel?: number;
}

export async function generateCoverLetter(
  user: UserProfile,
  job: JobDetails
): Promise<string> {
  const userSkills = user.skills?.join(", ") || "various skills";
  const userLanguages = user.languages?.join(", ") || "English";
  const jobSkills = job.skills?.join(", ") || "the required skills";
  
  const experienceText = user.experience && user.experience.length > 0
    ? `I have experience as:\n${user.experience.map(exp => `- ${exp.role} at ${exp.company} (${exp.duration})`).join("\n")}`
    : "I am eager to bring my skills and enthusiasm to this role.";

  const prompt = `You are an expert job application assistant for South African job seekers. Generate a professional, compelling cover letter for this job application.

Job Details:
- Position: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Salary: ${job.salary}
- Required Skills: ${jobSkills}
${job.sector ? `- Sector: ${job.sector}` : ""}
${job.nqfLevel ? `- NQF Level: ${job.nqfLevel}` : ""}

Job Description:
${job.description}

Applicant Profile:
- Name: ${user.name || "Applicant"}
- Location: ${user.location || "South Africa"}
- Skills: ${userSkills}
- Languages: ${userLanguages}
${user.nqfLevel ? `- NQF Level: ${user.nqfLevel}` : ""}

${experienceText}

Write a concise, professional cover letter (max 250 words) that:
1. Shows genuine interest in the role and company
2. Highlights relevant skills and experience matching the job requirements
3. Demonstrates understanding of the South African job market
4. Uses professional but warm tone
5. Ends with a strong call to action

Format the letter with proper business letter structure but without addresses (we'll add those separately).`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert career advisor and cover letter writer specializing in the South African job market. Write compelling, professional cover letters that help candidates stand out. Always write in a professional yet warm tone.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 800,
      top_p: 0.9,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("AI returned empty response");
    }

    // Basic validation of generated content
    if (content.length < 100) {
      throw new Error("Generated cover letter is too short");
    }

    return content;
  } catch (error: any) {
    console.error("Error generating cover letter:", error);
    
    // Provide more specific error messages
    if (error.message?.includes("rate limit")) {
      throw new Error("AI service rate limit reached. Please try again in a few moments.");
    } else if (error.message?.includes("timeout")) {
      throw new Error("AI service timed out. Please try again.");
    } else {
      throw new Error(error.message || "Failed to generate cover letter");
    }
  }
}

export async function generateApplicationMessage(
  user: UserProfile,
  job: JobDetails
): Promise<string> {
  const prompt = `Generate a brief, professional application message (max 100 words) for this job:

Position: ${job.title} at ${job.company}
Applicant: ${user.name || "Job seeker"}
Skills: ${user.skills?.join(", ") || "various skills"}

The message should be enthusiastic, professional, and highlight why they're a good fit. This will be used as an initial application message.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional job application assistant. Write brief, impactful application messages.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || "I am very interested in this position and believe I would be a great fit for your team.";
  } catch (error) {
    console.error("Error generating application message:", error);
    throw new Error("Failed to generate application message");
  }
}

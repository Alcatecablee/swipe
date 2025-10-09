import nodemailer from 'nodemailer';
import type { User, Job } from '@shared/schema';

interface EmailApplicationData {
  user: User;
  job: Job;
  coverLetter: string;
  resumeUrl?: string;
}

// Create transporter (use Gmail or custom SMTP)
function createTransporter() {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.warn('Email credentials not configured. Email application features disabled.');
    return null;
  }

  return nodemailer.createTransport({
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPassword, // Use app-specific password for Gmail
    },
  });
}

export async function sendEmailApplication(data: EmailApplicationData): Promise<void> {
  const transporter = createTransporter();
  
  if (!transporter) {
    throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
  }

  const { user, job, coverLetter, resumeUrl } = data;

  // Extract email from job description or use a default pattern
  const jobEmail = extractEmailFromJob(job);
  
  if (!jobEmail) {
    throw new Error('No email address found for this job listing');
  }

  const subject = `Application for ${job.title} - ${user.name}`;
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #2563eb; color: white; padding: 20px; }
        .content { padding: 20px; }
        .footer { background: #f3f4f6; padding: 15px; font-size: 12px; color: #6b7280; }
        .cover-letter { white-space: pre-wrap; background: #f9fafb; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Job Application: ${job.title}</h2>
      </div>
      <div class="content">
        <p><strong>Applicant:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        ${user.phone ? `<p><strong>Phone:</strong> ${user.phone}</p>` : ''}
        ${user.location ? `<p><strong>Location:</strong> ${user.location}</p>` : ''}
        
        <h3>Cover Letter</h3>
        <div class="cover-letter">
          ${coverLetter.replace(/\n/g, '<br>')}
        </div>

        ${user.skills && user.skills.length > 0 ? `
          <h3>Key Skills</h3>
          <p>${user.skills.join(', ')}</p>
        ` : ''}

        ${resumeUrl ? `
          <p><strong>Resume:</strong> <a href="${resumeUrl}">Download Resume</a></p>
        ` : ''}
      </div>
      <div class="footer">
        <p>This application was sent via SwipeJob - South Africa's leading job application platform.</p>
        <p>Powered by AI to help job seekers find their perfect match.</p>
      </div>
    </body>
    </html>
  `;

  const textBody = `
Job Application: ${job.title}

Applicant: ${user.name}
Email: ${user.email}
${user.phone ? `Phone: ${user.phone}` : ''}
${user.location ? `Location: ${user.location}` : ''}

COVER LETTER:
${coverLetter}

${user.skills && user.skills.length > 0 ? `\nKEY SKILLS:\n${user.skills.join(', ')}` : ''}

${resumeUrl ? `\nRESUME: ${resumeUrl}` : ''}

---
This application was sent via SwipeJob - South Africa's leading job application platform.
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${user.name} via SwipeJob" <${process.env.EMAIL_USER}>`,
      to: jobEmail,
      replyTo: user.email,
      subject: subject,
      text: textBody,
      html: htmlBody,
    });

    console.log('Email application sent:', info.messageId);
    return;
  } catch (error) {
    console.error('Failed to send email application:', error);
    throw new Error('Failed to send email application. Please try applying manually.');
  }
}

// Extract email from job description or applicationUrl
function extractEmailFromJob(job: Job): string | null {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  
  // Check application URL first
  if (job.applicationUrl) {
    const match = job.applicationUrl.match(emailRegex);
    if (match) return match[0];
  }
  
  // Check job description
  if (job.description) {
    const match = job.description.match(emailRegex);
    if (match) return match[0];
  }

  // Check company (sometimes email is in company field)
  if (job.company) {
    const match = job.company.match(emailRegex);
    if (match) return match[0];
  }

  return null;
}

// Check if a job accepts email applications
export function canApplyViaEmail(job: Job): boolean {
  const email = extractEmailFromJob(job);
  return email !== null;
}

export function getJobApplicationEmail(job: Job): string | null {
  return extractEmailFromJob(job);
}

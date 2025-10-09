import nodemailer from 'nodemailer';
import type { User, Job } from '@shared/schema';

interface EmailApplicationData {
  user: User;
  job: Job;
  coverLetter: string;
  resumeUrl?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Create transporter with multiple provider support
function createTransporter() {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  // SMTP configuration for custom providers (Resend, SendGrid, etc.)
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;

  if (!emailUser || !emailPassword) {
    console.warn('Email credentials not configured. Email application features disabled.');
    return null;
  }

  // Use custom SMTP if configured (Resend, SendGrid, etc.)
  if (smtpHost && smtpPort) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpPort === '465',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  }

  // Fallback to service provider (Gmail, etc.)
  return nodemailer.createTransport({
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPassword, // Use app-specific password for Gmail
    },
  });
}

export async function sendEmailApplication(data: EmailApplicationData): Promise<EmailResult> {
  const transporter = createTransporter();
  
  if (!transporter) {
    return {
      success: false,
      error: 'Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.'
    };
  }

  const { user, job, coverLetter, resumeUrl } = data;

  // Extract email from job
  const jobEmail = extractEmailFromJob(job);
  
  if (!jobEmail) {
    return {
      success: false,
      error: 'No email address found for this job listing'
    };
  }

  const subject = `Application for ${job.title} - ${user.name}`;
  const currentYear = new Date().getFullYear();
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white; 
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content { 
          padding: 30px 20px; 
        }
        .info-section {
          background: #f9fafb;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        .info-section p {
          margin: 8px 0;
        }
        .info-section strong {
          color: #059669;
        }
        .cover-letter { 
          white-space: pre-wrap; 
          background: #ffffff;
          padding: 20px; 
          border-left: 4px solid #10b981; 
          margin: 20px 0;
          border-radius: 4px;
          line-height: 1.8;
        }
        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        .skill-tag {
          background: #d1fae5;
          color: #065f46;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }
        .resume-button {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin-top: 10px;
        }
        .footer { 
          background: #f9fafb; 
          padding: 20px; 
          font-size: 12px; 
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        .popia-notice {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 12px 15px;
          margin: 20px 0;
          font-size: 13px;
          line-height: 1.6;
        }
        .popia-notice strong {
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Job Application: ${job.title}</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">${job.company}</p>
        </div>
        
        <div class="content">
          <div class="info-section">
            <p><strong>Applicant Name:</strong> ${user.name || 'Not provided'}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            ${user.phone ? `<p><strong>Phone:</strong> ${user.phone}</p>` : ''}
            ${user.location ? `<p><strong>Location:</strong> ${user.location}</p>` : ''}
            ${user.nqfLevel ? `<p><strong>NQF Level:</strong> ${user.nqfLevel}</p>` : ''}
          </div>
          
          <h2 style="color: #059669; margin-top: 30px;">Cover Letter</h2>
          <div class="cover-letter">${coverLetter.replace(/\n/g, '<br>')}</div>

          ${user.skills && user.skills.length > 0 ? `
            <h3 style="color: #059669; margin-top: 30px;">Key Skills</h3>
            <div class="skills">
              ${user.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          ` : ''}

          ${resumeUrl ? `
            <h3 style="color: #059669; margin-top: 30px;">Resume / CV</h3>
            <a href="${resumeUrl}" class="resume-button">Download Resume (PDF)</a>
          ` : ''}

          <div class="popia-notice">
            <strong>POPIA Compliance Notice:</strong><br>
            This application was submitted via SwipeJob (swipejob.co.za) on behalf of ${user.name || 'the applicant'}. 
            The candidate has explicitly consented to this automated submission and the processing of their personal information. 
            All personal data is handled in accordance with the Protection of Personal Information Act (POPIA) Act 4 of 2013.<br><br>
            For data access, correction, or deletion requests, please contact: privacy@swipejob.co.za
          </div>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>This application was sent via SwipeJob</strong></p>
          <p style="margin: 0;">South Africa's AI-powered job application platform helping job seekers find their perfect match.</p>
          <p style="margin: 10px 0 0 0; opacity: 0.7;">© ${currentYear} SwipeJob. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textBody = `
JOB APPLICATION: ${job.title}
Company: ${job.company}

===========================================

APPLICANT INFORMATION:
Name: ${user.name || 'Not provided'}
Email: ${user.email}
${user.phone ? `Phone: ${user.phone}` : ''}
${user.location ? `Location: ${user.location}` : ''}
${user.nqfLevel ? `NQF Level: ${user.nqfLevel}` : ''}

===========================================

COVER LETTER:

${coverLetter}

===========================================

${user.skills && user.skills.length > 0 ? `
KEY SKILLS:
${user.skills.join(', ')}

===========================================
` : ''}

${resumeUrl ? `RESUME / CV:
Download: ${resumeUrl}

===========================================
` : ''}

POPIA COMPLIANCE NOTICE:
This application was submitted via SwipeJob (swipejob.co.za) on behalf of ${user.name || 'the applicant'}. 
The candidate has explicitly consented to this automated submission and the processing of their personal information. 
All personal data is handled in accordance with the Protection of Personal Information Act (POPIA) Act 4 of 2013.

For data access, correction, or deletion requests, please contact: privacy@swipejob.co.za

---
This application was sent via SwipeJob - South Africa's AI-powered job application platform.
© ${currentYear} SwipeJob. All rights reserved.
  `;

  try {
    const fromName = user.name || 'SwipeJob Applicant';
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: jobEmail,
      replyTo: user.email,
      subject: subject,
      text: textBody,
      html: htmlBody,
      headers: {
        'X-Application-Platform': 'SwipeJob',
        'X-Application-Method': 'Email',
      }
    });

    console.log(`Email application sent successfully to ${jobEmail}. Message ID: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error: any) {
    console.error('Failed to send email application:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email application. Please try applying manually.'
    };
  }
}

// Extract email from job description or applicationUrl with enhanced detection
function extractEmailFromJob(job: Job): string | null {
  // Check if we already have it stored
  if (job.applicationEmail) {
    return job.applicationEmail;
  }

  // Multiple email patterns for South African context
  const emailPatterns = [
    // Standard email with context clues
    /(?:apply|send|submit|email|contact|reach).*?(?:to|at|:)?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?:co\.za|com|org|net))/gi,
    // Mailto links
    /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
    // General email pattern (fallback)
    /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?:co\.za|com|org|net))\b/gi,
  ];

  const sources = [
    job.applicationUrl,
    job.description,
    job.company,
  ];

  for (const pattern of emailPatterns) {
    for (const source of sources) {
      if (!source) continue;
      
      const matches = Array.from(source.matchAll(pattern));
      if (matches.length > 0) {
        // Get the email (first capture group or full match)
        const email = matches[0][1] || matches[0][0];
        // Clean up mailto: prefix if present
        const cleanEmail = email.replace('mailto:', '').toLowerCase();
        
        // Validate it's not a generic placeholder
        if (!isPlaceholderEmail(cleanEmail)) {
          return cleanEmail;
        }
      }
    }
  }

  return null;
}

// Check if email is a placeholder/example
function isPlaceholderEmail(email: string): boolean {
  const placeholders = [
    'example@',
    'test@',
    'yourname@',
    'youremail@',
    'email@example',
    'name@company',
  ];
  
  const lowerEmail = email.toLowerCase();
  return placeholders.some(placeholder => lowerEmail.includes(placeholder));
}

// Check if a job accepts email applications
export function canApplyViaEmail(job: Job): boolean {
  const email = extractEmailFromJob(job);
  return email !== null && email.length > 0;
}

export function getJobApplicationEmail(job: Job): string | null {
  return extractEmailFromJob(job);
}

// Detect application method from job data
export function detectApplicationMethod(job: Job): 'email' | 'url' | 'unknown' {
  // Check for email first (highest priority)
  if (job.applicationEmail || extractEmailFromJob(job)) {
    return 'email';
  }
  
  // Check for application URL
  if (job.applicationUrl && !job.applicationUrl.includes('google.com/search')) {
    return 'url';
  }
  
  return 'unknown';
}

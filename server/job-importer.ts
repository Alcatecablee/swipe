import { db } from './db';
import { jobs } from '@shared/schema';
import { sql } from 'drizzle-orm';

interface CSVJobRow {
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  skills?: string; // Comma-separated
  workType?: 'remote' | 'hybrid' | 'onsite';
  sector?: string;
  nqfLevel?: number;
  applicationUrl?: string;
}

export function parseCSV(csvContent: string): CSVJobRow[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: CSVJobRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });

    // Validate required fields
    if (!row.title || !row.company || !row.location || !row.description) {
      console.warn(`Skipping row ${i}: Missing required fields`);
      continue;
    }

    rows.push({
      title: row.title,
      company: row.company,
      location: row.location,
      salary: row.salary || undefined,
      description: row.description,
      skills: row.skills || undefined,
      workType: row.workType as 'remote' | 'hybrid' | 'onsite' || undefined,
      sector: row.sector || undefined,
      nqfLevel: row.nqfLevel ? parseInt(row.nqfLevel) : undefined,
      applicationUrl: row.applicationUrl || undefined,
    });
  }

  return rows;
}

// Parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

export async function importJobsFromCSV(csvContent: string): Promise<{ 
  success: number; 
  failed: number; 
  errors: string[] 
}> {
  const csvRows = parseCSV(csvContent);
  let successCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (const row of csvRows) {
    try {
      // Parse skills from comma-separated string
      const skills = row.skills 
        ? row.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      await db.insert(jobs).values({
        title: row.title,
        company: row.company,
        location: row.location,
        salary: row.salary || 'Competitive',
        description: row.description,
        skills,
        workType: row.workType || null,
        sector: row.sector || null,
        nqfLevel: row.nqfLevel || null,
        applicationUrl: row.applicationUrl || null,
        isActive: true,
      });

      successCount++;
    } catch (error: any) {
      failedCount++;
      errors.push(`Failed to import ${row.title} at ${row.company}: ${error.message}`);
      console.error(`Import error for ${row.title}:`, error);
    }
  }

  return {
    success: successCount,
    failed: failedCount,
    errors,
  };
}

// Generate CSV template for users to download
export function generateCSVTemplate(): string {
  const headers = [
    'title',
    'company',
    'location',
    'salary',
    'description',
    'skills',
    'workType',
    'sector',
    'nqfLevel',
    'applicationUrl'
  ];

  const exampleRow = [
    'Software Engineer',
    'TechCo',
    'Cape Town',
    'R40,000 - R60,000',
    'We are looking for a talented software engineer to join our team.',
    'JavaScript,React,Node.js,PostgreSQL',
    'hybrid',
    'Technology',
    '7',
    'https://techco.co.za/careers/apply'
  ];

  return `${headers.join(',')}\n${exampleRow.join(',')}`;
}

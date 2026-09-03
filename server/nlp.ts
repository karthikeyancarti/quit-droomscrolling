import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { ParsedResumeData, WorkExperience, Education } from '../src/types';

// Broad skill ontology covering software, data, devops, product, design, and soft skills
const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  'React', 'React.js', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux', 'Zustand',
  'Node.js', 'Express', 'NestJS', 'FastAPI', 'Django', 'Flask', 'Spring Boot', 'Ruby on Rails', 'ASP.NET', 'GraphQL', 'REST API',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB', 'Cassandra', 'SQLite', 'Prisma', 'TypeORM', 'SQLAlchemy',
  'AWS', 'Amazon Web Services', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'GitHub Actions', 'Jenkins', 'Linux',
  'Git', 'Microservices', 'Kafka', 'RabbitMQ', 'System Design', 'Agile', 'Scrum', 'Jira',
  'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'scikit-learn', 'NLP', 'Natural Language Processing', 'spaCy', 'Pandas', 'NumPy',
  'Figma', 'UI/UX Design', 'User Research', 'Wireframing', 'Prototyping',
  'Product Management', 'Roadmapping', 'A/B Testing', 'Product Analytics', 'OKRs',
  'Team Leadership', 'Mentorship', 'Code Review', 'Cross-functional Collaboration', 'Technical Writing'
];

export async function extractTextFromFile(buffer: Buffer, mimeType: string, fileName: string): Promise<string> {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (mimeType === 'application/pdf' || ext === 'pdf') {
    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      if (typeof result === 'string') return result;
      if (result && typeof (result as any).text === 'string') return (result as any).text;
      return JSON.stringify(result);
    } catch (err) {
      console.error('PDF parsing error:', err);
      // Fallback: try raw string conversion if text-based
      return buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ');
    }
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    } catch (err) {
      console.error('DOCX parsing error:', err);
      return buffer.toString('utf-8');
    }
  }

  // Plain text or fallback
  return buffer.toString('utf-8');
}

export function parseResumeText(rawText: string): { parsed: ParsedResumeData; needsReview: boolean; reason?: string } {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  
  // 1. Email extraction
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
  const emailMatch = rawText.match(emailRegex);
  const email = emailMatch ? emailMatch[1].toLowerCase() : '';

  // 2. Phone extraction
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = rawText.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  // 3. Name extraction
  let name = '';
  const noiseWords = ['resume', 'curriculum', 'vitae', 'cv', 'profile', 'contact', 'email', 'phone', 'summary', 'page'];
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    const isNoise = noiseWords.some(w => lower.includes(w)) || line.includes('@') || phoneRegex.test(line);
    // Names are usually 2 to 4 words, alphabetic
    if (!isNoise && /^[A-Z][a-zA-Z.'-]+(\s+[A-Z][a-zA-Z.'-]+){1,3}$/.test(line)) {
      name = line;
      break;
    }
  }
  if (!name && lines.length > 0) {
    // Fallback: first non-empty line without symbols
    const candidateLine = lines[0];
    if (candidateLine.length < 50 && !candidateLine.includes('@')) {
      name = candidateLine;
    }
  }

  // 4. Skills extraction
  const extractedSkills: string[] = [];
  const lowerText = ' ' + rawText.toLowerCase().replace(/[,/]/g, ' ') + ' ';
  
  COMMON_SKILLS.forEach(skill => {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, 'i');
    if (regex.test(lowerText)) {
      extractedSkills.push(skill);
    }
  });

  // 5. Work history extraction
  const workHistory: WorkExperience[] = [];
  const expIndex = lines.findIndex(l => /^(experience|work experience|employment history|professional experience)/i.test(l));
  const eduIndex = lines.findIndex(l => /^(education|academic background|qualifications)/i.test(l));

  // Date range regex (e.g. 2019 - 2023, Jan 2020 - Present, 03/2018 - 09/2021)
  const dateRangeRegex = /(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(\d{4})\s*(?:-|–|to)\s*(?:present|(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(\d{4}))/i;

  let totalYears = 0;

  if (expIndex !== -1) {
    const endExp = eduIndex > expIndex ? eduIndex : Math.min(lines.length, expIndex + 30);
    const expLines = lines.slice(expIndex + 1, endExp);

    let currentWork: Partial<WorkExperience> | null = null;

    for (const line of expLines) {
      const matchDate = line.match(dateRangeRegex);
      if (matchDate) {
        if (currentWork && currentWork.title) {
          workHistory.push(finalizeWork(currentWork));
        }
        
        const startYear = parseInt(matchDate[2], 10);
        const endYear = matchDate[4] ? parseInt(matchDate[4], 10) : new Date().getFullYear();
        const diff = Math.max(1, endYear - startYear);
        totalYears += diff;

        currentWork = {
          duration: matchDate[0],
          years: diff,
          description: '',
          title: line.replace(matchDate[0], '').replace(/[|•–-]/g, '').trim() || 'Software Engineer',
          company: 'Tech Enterprise'
        };
      } else if (currentWork) {
        if (!currentWork.company || currentWork.company === 'Tech Enterprise') {
          if (line.length < 50 && !line.startsWith('•') && !line.startsWith('-')) {
            currentWork.company = line;
            continue;
          }
        }
        currentWork.description = (currentWork.description ? currentWork.description + ' ' : '') + line;
      }
    }
    if (currentWork && currentWork.title) {
      workHistory.push(finalizeWork(currentWork));
    }
  }

  // Fallback check for explicit years of experience in text: e.g. "6 years of experience"
  const expMatch = rawText.match(/(\d+)\+?\s*(?:years|yrs)(?:\s+of)?\s+experience/i);
  if (expMatch && (!totalYears || parseInt(expMatch[1], 10) > totalYears)) {
    totalYears = parseInt(expMatch[1], 10);
  }

  // If still no experience but we detected 1 job, default to 2
  if (totalYears === 0 && workHistory.length > 0) {
    totalYears = workHistory.reduce((acc, w) => acc + w.years, 0) || 2;
  }

  // 6. Education extraction
  const educationList: Education[] = [];
  if (eduIndex !== -1) {
    const eduLines = lines.slice(eduIndex + 1, Math.min(lines.length, eduIndex + 15));
    for (const line of eduLines) {
      if (/(bachelor|master|b\.s|m\.s|b\.tech|m\.tech|phd|diploma|degree)/i.test(line)) {
        educationList.push({
          degree: line,
          institution: 'University / Institute'
        });
      }
    }
  }
  if (educationList.length === 0) {
    // Look for degree anywhere
    const degMatch = rawText.match(/(?:Bachelor|Master|B\.S\.|M\.S\.|B\.Tech|Ph\.D)[^,\n]+/i);
    if (degMatch) {
      educationList.push({
        degree: degMatch[0].trim(),
        institution: 'Accredited Institution'
      });
    }
  }

  // 7. Review Confidence Assessment
  let needsReview = false;
  let reason = '';

  if (!name || name.length < 3) {
    needsReview = true;
    reason = 'Candidate name could not be reliably extracted.';
  } else if (!email) {
    needsReview = true;
    reason = 'No valid email address found in the resume.';
  } else if (extractedSkills.length < 2) {
    needsReview = true;
    reason = 'Low skill extraction confidence (fewer than 2 recognized skills).';
  } else if (totalYears === 0 && workHistory.length === 0) {
    needsReview = true;
    reason = 'Experience timeline could not be parsed automatically.';
  }

  const parsed: ParsedResumeData = {
    name: name || 'Candidate',
    email: email || '',
    phone: phone || '',
    location: '',
    skills: Array.from(new Set(extractedSkills)),
    work_history: workHistory,
    education: educationList,
    total_years_experience: totalYears,
    summary: lines.slice(0, 4).join(' ').substring(0, 220)
  };

  return { parsed, needsReview, reason };
}

function finalizeWork(work: Partial<WorkExperience>): WorkExperience {
  return {
    company: work.company || 'Tech Company',
    title: work.title || 'Role Specialist',
    duration: work.duration || '2021 - Present',
    years: work.years || 2,
    description: (work.description || '').substring(0, 300)
  };
}

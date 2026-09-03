import { Job, Candidate, MatchBreakdown, SemanticMatchDetail } from '../src/types';

// Semantic cluster dictionary: maps skills to conceptually equivalent or closely aligned competencies
const SEMANTIC_CLUSTERS: Record<string, string[]> = {
  'team leadership': ['led a team', 'mentorship', 'tech lead', 'engineering manager', 'people management', 'scrum master', 'leadership', 'team management'],
  'leadership': ['team leadership', 'tech lead', 'mentorship', 'engineering management'],
  'react': ['react.js', 'next.js', 'frontend', 'redux', 'single page applications', 'vue.js'],
  'react.js': ['react', 'next.js', 'frontend', 'redux', 'vue.js'],
  'node.js': ['express', 'nestjs', 'fastapi', 'backend', 'rest api', 'javascript runtime'],
  'typescript': ['javascript', 'es6', 'typed javascript', 'frontend architecture'],
  'aws': ['cloud', 'amazon web services', 'ec2', 's3', 'gcp', 'azure', 'cloud architecture', 'devops'],
  'amazon web services': ['aws', 'cloud', 'ec2', 's3', 'gcp', 'azure'],
  'docker': ['containerization', 'containers', 'kubernetes', 'devops', 'ci/cd'],
  'kubernetes': ['k8s', 'docker', 'container orchestration', 'cloud native', 'helm'],
  'postgresql': ['postgres', 'sql', 'rdbms', 'relational databases', 'mysql', 'prisma', 'sqlalchemy'],
  'sql': ['postgresql', 'mysql', 'sqlite', 'relational database', 'database design'],
  'python': ['fastapi', 'django', 'flask', 'data science', 'machine learning', 'scripting'],
  'ci/cd': ['github actions', 'jenkins', 'gitlab ci', 'continuous integration', 'devops', 'deployment pipeline'],
  'system design': ['distributed systems', 'microservices', 'high availability', 'scalability', 'architecture'],
  'machine learning': ['deep learning', 'pytorch', 'tensorflow', 'scikit-learn', 'nlp', 'data science'],
  'product management': ['product strategy', 'roadmap', 'user research', 'agile', 'feature prioritization', 'product analytics'],
  'ui/ux design': ['figma', 'wireframing', 'prototyping', 'user research', 'design systems', 'product design']
};

export function extractSkillsFromJobDescription(jdText: string): {
  required_skills: string[];
  nice_to_have_skills: string[];
  min_experience_years: number;
} {
  const lines = jdText.split('\n');
  const required: Set<string> = new Set();
  const niceToHave: Set<string> = new Set();

  let inNiceToHave = false;
  let inRequired = false;

  const expRegex = /(\d+)\+?\s*(?:years|yrs)(?:\s+of)?(?:\s+experience|\s+working)/i;
  let minExp = 3;
  const expMatch = jdText.match(expRegex);
  if (expMatch) {
    minExp = parseInt(expMatch[1], 10);
  }

  // Scan section headers
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(nice to have|preferred|bonus|plus|good to have|optional)/i.test(trimmed)) {
      inNiceToHave = true;
      inRequired = false;
      continue;
    }
    if (/^(requirements|must have|qualifications|what you need|what we are looking for|technical skills)/i.test(trimmed)) {
      inRequired = true;
      inNiceToHave = false;
      continue;
    }

    // Check for bullet skill words in current section
    const targetSet = inNiceToHave ? niceToHave : required;
    
    // Quick keyword scan on line
    for (const skillKey of Object.keys(SEMANTIC_CLUSTERS)) {
      const reg = new RegExp(`\\b${skillKey.replace('.', '\\.')}\\b`, 'i');
      if (reg.test(trimmed)) {
        // Format nicely
        const formatted = skillKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        targetSet.add(formatted);
      }
    }
  }

  // If no sections separated, default common skills found
  if (required.size === 0) {
    for (const skillKey of Object.keys(SEMANTIC_CLUSTERS)) {
      const reg = new RegExp(`\\b${skillKey.replace('.', '\\.')}\\b`, 'i');
      if (reg.test(jdText)) {
        const formatted = skillKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        required.add(formatted);
      }
    }
  }

  return {
    required_skills: Array.from(required).slice(0, 8),
    nice_to_have_skills: Array.from(niceToHave).slice(0, 5),
    min_experience_years: minExp
  };
}

export function calculateMatchScore(
  job: Pick<Job, 'required_skills' | 'nice_to_have_skills' | 'min_experience_years' | 'title'>,
  candidate: Pick<Candidate, 'parsed_data' | 'raw_text'>
): {
  score: number;
  explanation: string;
  breakdown: MatchBreakdown;
} {
  const candidateSkills = (candidate.parsed_data?.skills || []).map(s => s.toLowerCase());
  const resumeRawText = (candidate.raw_text || '').toLowerCase();
  
  const exactRequiredMatched: string[] = [];
  const missingRequired: string[] = [];
  const semanticMatches: SemanticMatchDetail[] = [];

  // Check required skills
  for (const skill of job.required_skills) {
    const sLower = skill.toLowerCase();
    const directFound = candidateSkills.some(cs => cs === sLower || cs.includes(sLower) || sLower.includes(cs));
    const textFound = new RegExp(`\\b${sLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(resumeRawText);

    if (directFound || textFound) {
      exactRequiredMatched.push(skill);
      semanticMatches.push({
        job_skill: skill,
        candidate_skill: skill,
        similarity: 1.0,
        type: 'exact'
      });
    } else {
      // Check semantic clusters
      const related = SEMANTIC_CLUSTERS[sLower] || [];
      let foundSemantic: string | null = null;
      let similarityScore = 0.85;

      for (const rel of related) {
        if (candidateSkills.some(cs => cs.includes(rel) || rel.includes(cs)) || resumeRawText.includes(rel)) {
          foundSemantic = rel;
          break;
        }
      }

      if (foundSemantic) {
        semanticMatches.push({
          job_skill: skill,
          candidate_skill: foundSemantic,
          similarity: similarityScore,
          type: 'semantic'
        });
      } else {
        missingRequired.push(skill);
        semanticMatches.push({
          job_skill: skill,
          candidate_skill: 'None found',
          similarity: 0,
          type: 'missing'
        });
      }
    }
  }

  // Check nice-to-have skills
  const exactNiceMatched: string[] = [];
  const missingNice: string[] = [];

  for (const skill of job.nice_to_have_skills) {
    const sLower = skill.toLowerCase();
    const directFound = candidateSkills.some(cs => cs === sLower || cs.includes(sLower) || sLower.includes(cs));
    const textFound = new RegExp(`\\b${sLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(resumeRawText);

    if (directFound || textFound) {
      exactNiceMatched.push(skill);
    } else {
      missingNice.push(skill);
    }
  }

  // Subscores
  const totalRequiredCount = job.required_skills.length || 1;
  const exactReqRatio = exactRequiredMatched.length / totalRequiredCount;
  const exactScore = Math.round(exactReqRatio * 100);

  const totalNiceCount = job.nice_to_have_skills.length || 1;
  const exactNiceRatio = job.nice_to_have_skills.length > 0 ? exactNiceMatched.length / totalNiceCount : 1;
  const niceScore = Math.round(exactNiceRatio * 100);

  // Semantic similarity bonus for non-exact items
  const semanticCount = semanticMatches.filter(m => m.type === 'semantic').length;
  const semanticBonus = Math.min(100, Math.round((semanticCount / Math.max(1, missingRequired.length + semanticCount)) * 85 + 15));

  // Experience comparison
  const expRequired = job.min_experience_years || 0;
  const expActual = candidate.parsed_data?.total_years_experience || 0;
  const expGap = expActual - expRequired;

  let expScore = 100;
  if (expGap < 0) {
    if (expGap === -1) expScore = 82;
    else if (expGap === -2) expScore = 65;
    else expScore = Math.max(35, 100 + expGap * 20);
  }

  // Composite formula: 45% exact required, 20% exact nice, 20% semantic overlap, 15% experience
  const rawComposite = (exactScore * 0.45) + (niceScore * 0.20) + (semanticBonus * 0.20) + (expScore * 0.15);
  const finalScore = Math.min(99, Math.max(25, Math.round(rawComposite)));

  // Generate 2-3 line natural language explanation
  let explanation = '';
  
  if (exactRequiredMatched.length > 0) {
    explanation += `Strong match on ${exactRequiredMatched.slice(0, 3).join(', ')}`;
    if (exactRequiredMatched.length > 3) {
      explanation += ` and ${exactRequiredMatched.length - 3} other key skills`;
    }
    explanation += ` (${exactRequiredMatched.length}/${totalRequiredCount} core requirements). `;
  } else {
    explanation += `Limited direct overlap with core requirements (${exactRequiredMatched.length}/${totalRequiredCount}). `;
  }

  if (semanticCount > 0) {
    const semPairs = semanticMatches.filter(m => m.type === 'semantic').map(m => `"${m.candidate_skill}" for ${m.job_skill}`);
    explanation += `Demonstrated semantic alignment in ${semPairs.slice(0, 2).join(', ')}. `;
  }

  if (missingRequired.length > 0) {
    explanation += `Missing: ${missingRequired.slice(0, 2).join(', ')}. `;
  }

  if (expGap >= 0) {
    explanation += `Exceeds experience requirements (${expActual} yrs vs ${expRequired} yrs required).`;
  } else {
    const gapAbs = Math.abs(expGap);
    explanation += `${gapAbs} year${gapAbs > 1 ? 's' : ''} short of required ${expRequired} years experience.`;
  }

  const breakdown: MatchBreakdown = {
    exact_required_matched: exactRequiredMatched,
    missing_required: missingRequired,
    exact_nice_matched: exactNiceMatched,
    missing_nice: missingNice,
    semantic_matches: semanticMatches,
    experience_required: expRequired,
    experience_actual: expActual,
    experience_gap: expGap,
    subscores: {
      exact_score: exactScore,
      semantic_score: semanticBonus,
      experience_score: expScore
    }
  };

  return {
    score: finalScore,
    explanation: explanation.trim(),
    breakdown
  };
}

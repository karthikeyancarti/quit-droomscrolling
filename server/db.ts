import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Job, Candidate, Application, PipelineEvent, Interview } from '../src/types';

export interface DatabaseSchema {
  users: User[];
  jobs: Job[];
  candidates: Candidate[];
  applications: Application[];
  pipeline_events: PipelineEvent[];
  interviews: Interview[];
}

const DB_FILE = path.join(process.cwd(), 'data_quitdroomscrolling.json');

// Initialize password hashes
const adminHash = bcrypt.hashSync('admin123', 10);
const recruiterHash = bcrypt.hashSync('recruiter123', 10);
const interviewerHash = bcrypt.hashSync('interviewer123', 10);

const SEED_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Elena Rostova',
    email: 'admin@quitdroomscrolling.org',
    password_hash: adminHash,
    role: 'admin',
    title: 'Head of People & Culture',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_recruiter',
    name: 'Marcus Vance',
    email: 'recruiter@quitdroomscrolling.org',
    password_hash: recruiterHash,
    role: 'recruiter',
    title: 'Senior Talent Partner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_interviewer',
    name: 'David Chen',
    email: 'david@quitdroomscrolling.org',
    password_hash: interviewerHash,
    role: 'interviewer',
    title: 'Staff Engineering Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

const SEED_JOBS: Job[] = [
  {
    id: 'job_fullstack',
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    description: `We are looking for a Senior Full Stack Engineer to scale our core B2B platform.
Requirements:
- 5+ years of software engineering experience
- Strong proficiency in TypeScript, React, and Node.js
- Experience with PostgreSQL, Prisma/TypeORM, and database performance tuning
- Familiarity with AWS cloud services (S3, ECS, Lambda) and Docker
- Demonstrated experience in team leadership or mentorship

Nice to have:
- Experience with GraphQL and real-time WebSockets
- Background in Next.js or micro-frontend architectures
- CI/CD automation with GitHub Actions`,
    required_skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Team Leadership'],
    nice_to_have_skills: ['GraphQL', 'Next.js', 'Docker', 'CI/CD'],
    min_experience_years: 5,
    created_by: 'usr_recruiter',
    created_by_name: 'Marcus Vance',
    status: 'active',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 'job_devops',
    title: 'Lead DevOps & Cloud Architect',
    department: 'Infrastructure',
    location: 'Remote (US/Canada)',
    type: 'Remote',
    description: `Join our Platform Engineering team to design robust multi-region infrastructure.
Requirements:
- 6+ years in DevOps, Site Reliability, or Cloud Architecture
- Deep hands-on experience with AWS and Kubernetes (EKS)
- Infrastructure as Code using Terraform
- Automated CI/CD pipelines and zero-downtime deployment strategies
- Proficiency in Python, Bash, or Go for tooling

Nice to have:
- Prometheus, Grafana, and Datadog monitoring
- Security compliance (SOC2, HIPAA) experience
- Kafka or event stream infrastructure`,
    required_skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Docker', 'Python'],
    nice_to_have_skills: ['Kafka', 'Linux', 'Microservices'],
    min_experience_years: 6,
    created_by: 'usr_admin',
    created_by_name: 'Elena Rostova',
    status: 'active',
    created_at: new Date(Date.now() - 18 * 86400000).toISOString()
  },
  {
    id: 'job_product',
    title: 'Principal Product Manager — Core Platform',
    department: 'Product',
    location: 'New York, NY',
    type: 'Hybrid',
    description: `Lead product strategy and execution for our high-throughput developer platform.
Requirements:
- 5+ years of product management experience for technical SaaS products
- Strong user research, roadmapping, and feature prioritization methodology
- Deep familiarity with Agile/Scrum development cycles
- Data fluency: Product Analytics, SQL, and A/B testing

Nice to have:
- Prior engineering or technical consulting background
- Experience with developer tools or API platforms`,
    required_skills: ['Product Management', 'Roadmapping', 'User Research', 'Agile', 'Product Analytics'],
    nice_to_have_skills: ['SQL', 'A/B Testing', 'Figma'],
    min_experience_years: 5,
    created_by: 'usr_recruiter',
    created_by_name: 'Marcus Vance',
    status: 'active',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'job_frontend',
    title: 'Senior Frontend Engineer (UI/UX Systems)',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: `Craft delightful, accessible user experiences and scalable design systems.
Requirements:
- 4+ years of focused frontend development
- Mastery of React, TypeScript, Next.js, and Tailwind CSS
- Deep knowledge of web accessibility (WCAG), performance optimization, and responsive design
- Experience collaborating with designers via Figma

Nice to have:
- Design systems stewardship (Storybook, Radix/Tailwind)
- Experience with motion libraries and micro-interactions`,
    required_skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Figma'],
    nice_to_have_skills: ['UI/UX Design', 'Code Review', 'Git'],
    min_experience_years: 4,
    created_by: 'usr_recruiter',
    created_by_name: 'Marcus Vance',
    status: 'active',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString()
  }
];

const SEED_CANDIDATES: Candidate[] = [
  {
    id: 'cand_1',
    name: 'Sarah Lin',
    email: 'sarah.lin@example.com',
    phone: '(415) 892-4120',
    location: 'San Francisco, CA',
    raw_text: `SARAH LIN
sarah.lin@example.com | (415) 892-4120 | San Francisco, CA
linkedin.com/in/sarahlin-tech

SUMMARY
Senior Full Stack Engineer with 6 years of experience building resilient microservices and performant web apps. Proven track record leading technical projects and mentoring junior devs.

WORK EXPERIENCE
Senior Software Engineer | FinTech Innovations | 2021 - Present
- Architected core payment processing service in TypeScript and Node.js handling $40M monthly volume.
- Migrated legacy dashboard to React 18 and Next.js, reducing bundle size by 42%.
- Optimized PostgreSQL queries and connection pooling, decreasing p99 latency from 450ms to 95ms.
- Led a team of 4 engineers across two product sprint quarters; conducted code reviews and sprint planning.
- Managed AWS infrastructure utilizing S3, ECS, RDS, and automated GitHub Actions CI/CD workflows.

Full Stack Developer | CloudScale Solutions | 2018 - 2021
- Developed REST APIs and internal tools using Node.js, Express, Docker, and MongoDB.
- Created responsive user interfaces with React and Tailwind CSS.
- Automated deployment scripts and containerized microservices with Docker.

EDUCATION
B.S. in Computer Science | University of California, Berkeley | 2014 - 2018

SKILLS
TypeScript, JavaScript, React, Node.js, Next.js, PostgreSQL, AWS, Docker, Git, REST API, Team Leadership, CI/CD, Tailwind CSS`,
    parsed_data: {
      name: 'Sarah Lin',
      email: 'sarah.lin@example.com',
      phone: '(415) 892-4120',
      location: 'San Francisco, CA',
      skills: ['TypeScript', 'JavaScript', 'React', 'Node.js', 'Next.js', 'PostgreSQL', 'AWS', 'Docker', 'Git', 'REST API', 'Team Leadership', 'CI/CD', 'Tailwind CSS'],
      work_history: [
        {
          company: 'FinTech Innovations',
          title: 'Senior Software Engineer',
          duration: '2021 - Present',
          years: 4,
          description: 'Architected core payment processing in TypeScript, Node.js, PostgreSQL, and AWS. Led engineering team of 4 engineers.'
        },
        {
          company: 'CloudScale Solutions',
          title: 'Full Stack Developer',
          duration: '2018 - 2021',
          years: 3,
          description: 'Built REST APIs in Node.js and user interfaces in React and Tailwind CSS with Docker.'
        }
      ],
      education: [
        {
          degree: 'B.S. in Computer Science',
          institution: 'University of California, Berkeley',
          year: '2018'
        }
      ],
      total_years_experience: 7,
      summary: 'Senior Full Stack Engineer with 7 years of experience in TypeScript, React, Node.js, PostgreSQL, AWS, and Team Leadership.'
    },
    needs_review: false,
    parse_status: 'completed',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 'cand_2',
    name: 'Alexandre Meyer',
    email: 'alex.meyer@devcloud.io',
    phone: '+1 (514) 732-9912',
    location: 'Montreal, Canada (Remote)',
    raw_text: `ALEXANDRE MEYER
alex.meyer@devcloud.io | Montreal, Canada
Cloud Architect & Senior DevOps Engineer

EXPERIENCE
Lead Infrastructure Engineer | Apex Systems | 2020 - Present
- Maintained production Kubernetes clusters (EKS) across 3 AWS regions for 2M daily active users.
- Automated 100% of infrastructure provisioning using Terraform and Atlantis GitOps.
- Built reusable CI/CD templates with GitHub Actions and Docker reducing build times by 50%.
- Authored automation scripts in Python and Go for dynamic cluster autoscaling and cost optimization.

DevOps Engineer | Nordic Telematics | 2016 - 2020
- Built zero-downtime blue/green deployment pipelines with Jenkins and Linux containers.
- Managed Kafka distributed streaming pipelines for telemetry ingestion.

EDUCATION
B.Tech in Computer Engineering | McGill University | 2012 - 2016

SKILLS
AWS, Kubernetes, Terraform, Docker, CI/CD, Linux, Python, Kafka, Microservices, Git`,
    parsed_data: {
      name: 'Alexandre Meyer',
      email: 'alex.meyer@devcloud.io',
      phone: '+1 (514) 732-9912',
      location: 'Montreal, Canada',
      skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'Linux', 'Python', 'Kafka', 'Microservices', 'Git'],
      work_history: [
        {
          company: 'Apex Systems',
          title: 'Lead Infrastructure Engineer',
          duration: '2020 - Present',
          years: 5,
          description: 'Maintained AWS EKS Kubernetes clusters, Terraform infrastructure as code, Python automation.'
        },
        {
          company: 'Nordic Telematics',
          title: 'DevOps Engineer',
          duration: '2016 - 2020',
          years: 4,
          description: 'Zero-downtime CI/CD pipelines, Kafka streaming, Linux container orchestration.'
        }
      ],
      education: [
        {
          degree: 'B.Tech in Computer Engineering',
          institution: 'McGill University',
          year: '2016'
        }
      ],
      total_years_experience: 9,
      summary: 'Senior Cloud & DevOps Architect with 9 years specializing in AWS, Kubernetes, Terraform, and Python automation.'
    },
    needs_review: false,
    parse_status: 'completed',
    created_at: new Date(Date.now() - 17 * 86400000).toISOString()
  },
  {
    id: 'cand_3',
    name: 'Priya Sharma',
    email: 'priya.sharma@producthub.org',
    phone: '(917) 555-0199',
    location: 'New York, NY',
    raw_text: `PRIYA SHARMA
priya.sharma@producthub.org | New York, NY
Principal Product Manager

EXPERIENCE
Senior Product Manager | Databloom SaaS | 2020 - Present
- Spearheaded company-wide data platform redesign, increasing self-serve adoption by 64%.
- Conducted 80+ customer discovery interviews, created product roadmaps, and prioritized backlog.
- Partnered with engineering in Agile/Scrum sprints, defining PRDs and acceptance criteria.
- Utilized SQL and Mixpanel product analytics to model cohort retention and run A/B experiments.

Product Manager | E-Commerce Next | 2017 - 2020
- Shipped checkout optimization features increasing conversion rate by 3.8%.
- Designed wireframes and user journeys in Figma.

EDUCATION
M.B.A. | Columbia Business School | 2017
B.S. in Economics | NYU | 2014

SKILLS
Product Management, Roadmapping, User Research, Agile, Product Analytics, SQL, A/B Testing, Figma, Wireframing`,
    parsed_data: {
      name: 'Priya Sharma',
      email: 'priya.sharma@producthub.org',
      phone: '(917) 555-0199',
      location: 'New York, NY',
      skills: ['Product Management', 'Roadmapping', 'User Research', 'Agile', 'Product Analytics', 'SQL', 'A/B Testing', 'Figma', 'Wireframing'],
      work_history: [
        {
          company: 'Databloom SaaS',
          title: 'Senior Product Manager',
          duration: '2020 - Present',
          years: 5,
          description: 'Product strategy, Agile execution, SQL product analytics, customer discovery.'
        },
        {
          company: 'E-Commerce Next',
          title: 'Product Manager',
          duration: '2017 - 2020',
          years: 3,
          description: 'A/B testing, user research, roadmap definition.'
        }
      ],
      education: [
        { degree: 'M.B.A.', institution: 'Columbia Business School', year: '2017' },
        { degree: 'B.S. in Economics', institution: 'NYU', year: '2014' }
      ],
      total_years_experience: 8,
      summary: 'Product executive with 8 years leading B2B SaaS roadmaps, Agile sprints, SQL analytics, and user research.'
    },
    needs_review: false,
    parse_status: 'completed',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 'cand_4',
    name: 'Jordan Miller',
    email: 'jordan.miller@frontendcraft.dev',
    phone: '(206) 441-2098',
    location: 'Seattle, WA (Remote)',
    raw_text: `JORDAN MILLER
jordan.miller@frontendcraft.dev | Seattle, WA
Senior Frontend & UI Engineer

EXPERIENCE
Staff UI Engineer | DesignSystem Co | 2021 - Present
- Created comprehensive enterprise design system in React, TypeScript, and Tailwind CSS adopted by 60+ engineers.
- Architected Next.js micro-frontends with WCAG 2.1 AA accessibility compliance and 98+ Lighthouse scores.
- Collaborated closely with Figma design team to establish component tokens and animation guidelines.

Frontend Developer | Kinetic Apps | 2019 - 2021
- Built interactive dashboards in React, Redux, and Tailwind.
- Mentored junior devs on component composition and unit testing.

EDUCATION
B.S. in Human-Computer Interaction | University of Washington | 2019

SKILLS
React, TypeScript, Tailwind CSS, Next.js, Figma, UI/UX Design, Git, Code Review`,
    parsed_data: {
      name: 'Jordan Miller',
      email: 'jordan.miller@frontendcraft.dev',
      phone: '(206) 441-2098',
      location: 'Seattle, WA',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Figma', 'UI/UX Design', 'Git', 'Code Review'],
      work_history: [
        {
          company: 'DesignSystem Co',
          title: 'Staff UI Engineer',
          duration: '2021 - Present',
          years: 4,
          description: 'Built enterprise design system in React, Next.js, Tailwind CSS, and Figma.'
        },
        {
          company: 'Kinetic Apps',
          title: 'Frontend Developer',
          duration: '2019 - 2021',
          years: 2,
          description: 'React, responsive styling, accessibility.'
        }
      ],
      education: [
        { degree: 'B.S. in Human-Computer Interaction', institution: 'University of Washington', year: '2019' }
      ],
      total_years_experience: 6,
      summary: 'Frontend Engineer with 6 years experience in React, TypeScript, Next.js, Tailwind CSS, and Figma design systems.'
    },
    needs_review: false,
    parse_status: 'completed',
    created_at: new Date(Date.now() - 11 * 86400000).toISOString()
  },
  {
    id: 'cand_5',
    name: 'Carlos Gomez',
    email: 'carlos.g@email.com',
    phone: '(512) 302-8819',
    location: 'Austin, TX',
    raw_text: `Carlos Gomez - Full Stack Developer
Austin, TX | carlos.g@email.com
Experience:
Full Stack Engineer at WebWorks (2022 - Present)
Worked with JavaScript, Python, Django, and MySQL.
Built APIs and frontends.
Education: Bootcamp Certificate (2022)`,
    parsed_data: {
      name: 'Carlos Gomez',
      email: 'carlos.g@email.com',
      phone: '(512) 302-8819',
      location: 'Austin, TX',
      skills: ['JavaScript', 'Python', 'Django', 'MySQL', 'REST API'],
      work_history: [
        {
          company: 'WebWorks',
          title: 'Full Stack Engineer',
          duration: '2022 - Present',
          years: 3,
          description: 'JavaScript, Python, Django, MySQL APIs.'
        }
      ],
      education: [{ degree: 'Certificate', institution: 'Web Bootcamp', year: '2022' }],
      total_years_experience: 3,
      summary: 'Full Stack Developer with 3 years experience in JavaScript, Python, and relational databases.'
    },
    needs_review: false,
    parse_status: 'completed',
    created_at: new Date(Date.now() - 9 * 86400000).toISOString()
  },
  {
    id: 'cand_6',
    name: 'Emily Watson',
    email: 'emily.w@cloudstream.co',
    phone: '(312) 998-1002',
    location: 'Chicago, IL',
    raw_text: `EMILY WATSON
emily.w@cloudstream.co | Chicago, IL
DevOps & Cloud Engineer
6 years working with Docker, Kubernetes, Terraform, AWS, Linux, and CI/CD pipelines.
Extensive experience setting up monitoring and automated releases.`,
    parsed_data: {
      name: 'Emily Watson',
      email: 'emily.w@cloudstream.co',
      phone: '(312) 998-1002',
      location: 'Chicago, IL',
      skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'Linux', 'CI/CD', 'GitHub Actions'],
      work_history: [
        {
          company: 'Cloudstream',
          title: 'Senior DevOps Specialist',
          duration: '2019 - Present',
          years: 6,
          description: 'AWS, Kubernetes, Terraform, and automated deployment pipelines.'
        }
      ],
      education: [{ degree: 'B.S. in Information Systems', institution: 'UIUC', year: '2018' }],
      total_years_experience: 6,
      summary: 'Cloud & Infrastructure specialist with 6 years experience across AWS, Kubernetes, Terraform, and CI/CD.'
    },
    needs_review: false,
    parse_status: 'completed',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'cand_7',
    name: 'Tariq Al-Mansoor',
    email: 'tariq.m@platformlabs.io',
    phone: '(650) 809-3321',
    location: 'Palo Alto, CA',
    raw_text: `TARIQ AL-MANSOOR
tariq.m@platformlabs.io | Palo Alto, CA
Senior Backend & Systems Engineer
8 years experience building high throughput APIs in Go, Node.js, and TypeScript.
Strong database skills in PostgreSQL and Redis. Led engineering teams of 6 developers.`,
    parsed_data: {
      name: 'Tariq Al-Mansoor',
      email: 'tariq.m@platformlabs.io',
      phone: '(650) 809-3321',
      location: 'Palo Alto, CA',
      skills: ['Go', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Team Leadership', 'Microservices', 'REST API'],
      work_history: [
        {
          company: 'PlatformLabs',
          title: 'Lead Backend Engineer',
          duration: '2018 - Present',
          years: 7,
          description: 'Engineered high-throughput Go and Node.js microservices. Led team of 6 engineers.'
        }
      ],
      education: [{ degree: 'M.S. in Computer Science', institution: 'Stanford University', year: '2017' }],
      total_years_experience: 8,
      summary: 'Backend and Systems engineer with 8 years in TypeScript, Node.js, Go, PostgreSQL, and team leadership.'
    },
    needs_review: false,
    parse_status: 'completed',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'cand_8',
    name: 'Scan Resume Document #892',
    email: '',
    phone: '555-123-4567',
    location: 'Unknown',
    raw_text: `RAW SCAN DOCUMENT
Experienced developer with history in technology.
Contact: 555-123-4567.
Worked at consulting company. Skills include programming and design.`,
    parsed_data: {
      name: 'Candidate #892',
      email: '',
      phone: '555-123-4567',
      location: '',
      skills: ['Git'],
      work_history: [
        { company: 'Consulting Co', title: 'Developer', duration: '2022 - 2023', years: 1, description: 'General development.' }
      ],
      education: [],
      total_years_experience: 1,
      summary: 'Extraction confidence low due to document scanning artifacts.'
    },
    needs_review: true,
    review_reason: 'Candidate name and email could not be parsed reliably. Low recognized skills count (<2).',
    parse_status: 'needs_review',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'cand_9',
    name: 'Amina Diallo',
    email: 'amina.diallo@uxstrategy.net',
    phone: '(404) 772-9182',
    location: 'Atlanta, GA',
    raw_text: `AMINA DIALLO
amina.diallo@uxstrategy.net | Atlanta, GA
Senior Product Designer & UX Researcher
5 years designing accessible web apps in Figma. Created enterprise design systems and conducted qualitative user research.`,
    parsed_data: {
      name: 'Amina Diallo',
      email: 'amina.diallo@uxstrategy.net',
      phone: '(404) 772-9182',
      location: 'Atlanta, GA',
      skills: ['Figma', 'UI/UX Design', 'User Research', 'Wireframing', 'Prototyping', 'Product Design'],
      work_history: [
        { company: 'UX Strategy Lab', title: 'Senior Product Designer', duration: '2020 - Present', years: 5, description: 'Figma design systems and user research.' }
      ],
      education: [{ degree: 'B.F.A. in Interaction Design', institution: 'SCAD', year: '2019' }],
      total_years_experience: 5,
      summary: 'Design specialist with 5 years in Figma, user research, wireframing, and design systems.'
    },
    needs_review: false,
    parse_status: 'completed',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'cand_10',
    name: 'Kevin O\'Connor',
    email: 'kevin.oc@buildops.io',
    phone: '(617) 492-3301',
    location: 'Boston, MA',
    raw_text: `KEVIN O'CONNOR
kevin.oc@buildops.io | Boston, MA
Cloud & DevOps Engineer
5 years automating AWS infrastructure with Terraform, Kubernetes, Docker, and CI/CD pipelines. Strong Python and Linux foundation.`,
    parsed_data: {
      name: 'Kevin O\'Connor',
      email: 'kevin.oc@buildops.io',
      phone: '(617) 492-3301',
      location: 'Boston, MA',
      skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'Linux', 'Python'],
      work_history: [
        { company: 'BuildOps', title: 'DevOps Engineer', duration: '2020 - Present', years: 5, description: 'AWS, Kubernetes, Terraform.' }
      ],
      education: [{ degree: 'B.S. in Computer Systems', institution: 'Northeastern University', year: '2019' }],
      total_years_experience: 5,
      summary: 'Cloud engineer with 5 years across AWS, Kubernetes, Terraform, and Python automation.'
    },
    needs_review: false,
    parse_status: 'completed',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'cand_11',
    name: 'Maya Patel',
    email: 'maya.p@frontendscale.org',
    phone: '(303) 891-2290',
    location: 'Denver, CO',
    raw_text: `MAYA PATEL
maya.p@frontendscale.org | Denver, CO
Frontend Engineer
4 years experience with React, Next.js, TypeScript, and Tailwind CSS. Built high performance e-commerce applications.`,
    parsed_data: {
      name: 'Maya Patel',
      email: 'maya.p@frontendscale.org',
      phone: '(303) 891-2290',
      location: 'Denver, CO',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Figma', 'Git'],
      work_history: [
        { company: 'ScaleFront', title: 'Frontend Developer', duration: '2021 - Present', years: 4, description: 'React, Next.js, and responsive Tailwind UI.' }
      ],
      education: [{ degree: 'B.S. in Computer Science', institution: 'CU Boulder', year: '2020' }],
      total_years_experience: 4,
      summary: 'Frontend developer with 4 years in React, Next.js, TypeScript, and Tailwind CSS.'
    },
    needs_review: false,
    parse_status: 'completed',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'cand_12',
    name: 'Liam Zhang',
    email: 'liam.zhang@techhub.net',
    phone: '(415) 309-8877',
    location: 'San Jose, CA',
    raw_text: `LIAM ZHANG
liam.zhang@techhub.net | San Jose, CA
Product Manager
6 years driving SaaS product strategy, roadmap planning, user research, and Agile sprint execution. Proficient in SQL and A/B testing.`,
    parsed_data: {
      name: 'Liam Zhang',
      email: 'liam.zhang@techhub.net',
      phone: '(415) 309-8877',
      location: 'San Jose, CA',
      skills: ['Product Management', 'Roadmapping', 'User Research', 'Agile', 'Product Analytics', 'SQL', 'A/B Testing'],
      work_history: [
        { company: 'Enterprise Cloud', title: 'Product Manager', duration: '2019 - Present', years: 6, description: 'Product roadmaps, Agile sprints, SQL analytics.' }
      ],
      education: [{ degree: 'B.S. in Business Information Systems', institution: 'San Jose State', year: '2018' }],
      total_years_experience: 6,
      summary: 'Product Manager with 6 years experience in SaaS roadmapping, user research, Agile, and SQL analytics.'
    },
    needs_review: false,
    parse_status: 'completed',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'cand_13',
    name: 'Rachel Green',
    email: 'rachel.g@webflowtech.io',
    phone: '(212) 809-1234',
    location: 'Brooklyn, NY',
    raw_text: `RACHEL GREEN
rachel.g@webflowtech.io | Brooklyn, NY
Full Stack Engineer
5 years working with React, TypeScript, Node.js, Express, PostgreSQL, and AWS.`,
    parsed_data: {
      name: 'Rachel Green',
      email: 'rachel.g@webflowtech.io',
      phone: '(212) 809-1234',
      location: 'Brooklyn, NY',
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'REST API', 'Docker'],
      work_history: [
        { company: 'FinPulse', title: 'Software Engineer', duration: '2020 - Present', years: 5, description: 'React, Node.js, and PostgreSQL.' }
      ],
      education: [{ degree: 'B.A. in Computer Science', institution: 'Barnard College', year: '2019' }],
      total_years_experience: 5,
      summary: 'Full Stack Engineer with 5 years in React, TypeScript, Node.js, PostgreSQL, and AWS.'
    },
    needs_review: false,
    parse_status: 'completed',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'cand_14',
    name: 'Ethan Cole',
    email: 'ethan.cole@cloudnative.dev',
    phone: '(503) 778-9011',
    location: 'Portland, OR',
    raw_text: `ETHAN COLE
ethan.cole@cloudnative.dev | Portland, OR
Cloud Infrastructure Specialist
7 years building Kubernetes clusters, Terraform modules, Docker containers, and AWS environments.`,
    parsed_data: {
      name: 'Ethan Cole',
      email: 'ethan.cole@cloudnative.dev',
      phone: '(503) 778-9011',
      location: 'Portland, OR',
      skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'Linux', 'Python'],
      work_history: [
        { company: 'SaaS Native', title: 'Senior Infrastructure Engineer', duration: '2018 - Present', years: 7, description: 'Kubernetes and Terraform at scale.' }
      ],
      education: [{ degree: 'B.S. in Computer Science', institution: 'Oregon State', year: '2017' }],
      total_years_experience: 7,
      summary: 'Cloud engineer with 7 years specializing in AWS, Kubernetes, Terraform, and Docker.'
    },
    needs_review: false,
    parse_status: 'completed',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'cand_15',
    name: 'Chloe Bennett',
    email: 'chloe.bennett@pixelforge.io',
    phone: '(310) 902-1188',
    location: 'Los Angeles, CA',
    raw_text: `CHLOE BENNETT
chloe.bennett@pixelforge.io | Los Angeles, CA
Frontend Specialist
5 years designing interactive components in React, TypeScript, Next.js, and Tailwind CSS.`,
    parsed_data: {
      name: 'Chloe Bennett',
      email: 'chloe.bennett@pixelforge.io',
      phone: '(310) 902-1188',
      location: 'Los Angeles, CA',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Figma', 'UI/UX Design'],
      work_history: [
        { company: 'PixelForge', title: 'Senior Frontend Developer', duration: '2020 - Present', years: 5, description: 'Next.js, React, Tailwind CSS UI.' }
      ],
      education: [{ degree: 'B.S. in Media Arts', institution: 'UCLA', year: '2019' }],
      total_years_experience: 5,
      summary: 'Frontend developer with 5 years in React, TypeScript, Next.js, and Tailwind CSS.'
    },
    needs_review: false,
    parse_status: 'completed',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'cand_16',
    name: 'Samuel Torres',
    email: 'sam.torres@devs.net',
    phone: '(602) 412-9830',
    location: 'Phoenix, AZ',
    raw_text: `SAMUEL TORRES
sam.torres@devs.net | Phoenix, AZ
Junior Software Engineer
2 years building web apps in React, JavaScript, and Node.js. Enthusiastic learner.`,
    parsed_data: {
      name: 'Samuel Torres',
      email: 'sam.torres@devs.net',
      phone: '(602) 412-9830',
      location: 'Phoenix, AZ',
      skills: ['JavaScript', 'React', 'Node.js', 'HTML5', 'CSS3', 'Git'],
      work_history: [
        { company: 'AppStart', title: 'Junior Web Developer', duration: '2023 - Present', years: 2, description: 'React and Node.js bug fixes and feature tickets.' }
      ],
      education: [{ degree: 'B.S. in Software Engineering', institution: 'ASU', year: '2023' }],
      total_years_experience: 2,
      summary: 'Software engineer with 2 years in React, JavaScript, and Node.js.'
    },
    needs_review: false,
    parse_status: 'completed',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

const SEED_APPLICATIONS: Application[] = [
  // Full stack job
  {
    id: 'app_1',
    candidate_id: 'cand_1', // Sarah Lin
    job_id: 'job_fullstack',
    stage: 'offer',
    match_score: 95,
    match_explanation: 'Strong match on TypeScript, React, Node.js, PostgreSQL, and AWS (meets 6/6 core requirements). Demonstrated team leadership and mentoring experience. Exceeds experience requirements (7 yrs vs 5 yrs required).',
    applied_at: new Date(Date.now() - 19 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: 'Outstanding technical interview feedback. Offer extended for Senior Full Stack Lead.'
  },
  {
    id: 'app_2',
    candidate_id: 'cand_7', // Tariq Al-Mansoor
    job_id: 'job_fullstack',
    stage: 'interview',
    match_score: 88,
    match_explanation: 'Strong match on TypeScript, Node.js, PostgreSQL, and Team Leadership (meets 4/6 core requirements). Semantic overlap: Go & Docker infrastructure vs AWS. Exceeds experience requirements (8 yrs vs 5 yrs required).',
    applied_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    notes: 'Passed technical screening. Scheduled system design deep dive.'
  },
  {
    id: 'app_3',
    candidate_id: 'cand_13', // Rachel Green
    job_id: 'job_fullstack',
    stage: 'screened',
    match_score: 84,
    match_explanation: 'Strong match on React, TypeScript, Node.js, and PostgreSQL (meets 5/6 core requirements). Missing: formal Team Leadership. Meets required 5 years experience.',
    applied_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    notes: 'Recruiter phone screen passed. Good communication skills.'
  },
  {
    id: 'app_4',
    candidate_id: 'cand_5', // Carlos Gomez
    job_id: 'job_fullstack',
    stage: 'applied',
    match_score: 52,
    match_explanation: 'Limited direct overlap with core requirements (0/6). Semantic alignment: JavaScript/Python for TypeScript, MySQL for PostgreSQL. Missing: React, Node.js, AWS, Team Leadership. 2 years short of required 5 years experience.',
    applied_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'app_5',
    candidate_id: 'cand_16', // Samuel Torres
    job_id: 'job_fullstack',
    stage: 'applied',
    match_score: 48,
    match_explanation: 'Moderate match on React and Node.js (meets 2/6 core requirements). Missing: TypeScript, PostgreSQL, AWS, Team Leadership. 3 years short of required 5 years experience.',
    applied_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'app_6',
    candidate_id: 'cand_8', // Scan document #892 (needs review)
    job_id: 'job_fullstack',
    stage: 'applied',
    match_score: 30,
    match_explanation: 'Low skill extraction confidence. Missing primary requirements. Needs recruiter manual verification.',
    applied_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },

  // DevOps job
  {
    id: 'app_7',
    candidate_id: 'cand_2', // Alexandre Meyer
    job_id: 'job_devops',
    stage: 'hired',
    match_score: 96,
    match_explanation: 'Exceptional match on AWS, Kubernetes, Terraform, CI/CD, Docker, and Python (meets 6/6 core requirements). Demonstrated scale with Kafka and EKS. Exceeds experience requirements (9 yrs vs 6 yrs required).',
    applied_at: new Date(Date.now() - 16 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: 'Signed offer! Starting next Monday.'
  },
  {
    id: 'app_8',
    candidate_id: 'cand_6', // Emily Watson
    job_id: 'job_devops',
    stage: 'interview',
    match_score: 91,
    match_explanation: 'Strong match on AWS, Kubernetes, Terraform, Docker, and CI/CD (meets 5/6 core requirements). Missing: Python scripting. Meets required 6 years experience.',
    applied_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: 'Completed technical take-home. Interviewer noted clean Terraform structure.'
  },
  {
    id: 'app_9',
    candidate_id: 'cand_10', // Kevin O\'Connor
    job_id: 'job_devops',
    stage: 'screened',
    match_score: 87,
    match_explanation: 'Strong match on AWS, Kubernetes, Terraform, Docker, and Python (meets 6/6 core requirements). 1 year short of preferred 6 years experience (has 5 years).',
    applied_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'app_10',
    candidate_id: 'cand_14', // Ethan Cole
    job_id: 'job_devops',
    stage: 'applied',
    match_score: 93,
    match_explanation: 'Strong match on AWS, Kubernetes, Terraform, Docker, and Python (meets 6/6 core requirements). Exceeds experience requirements (7 yrs vs 6 yrs required).',
    applied_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },

  // Product job
  {
    id: 'app_11',
    candidate_id: 'cand_3', // Priya Sharma
    job_id: 'job_product',
    stage: 'offer',
    match_score: 96,
    match_explanation: 'Strong match on Product Management, Roadmapping, User Research, Agile, and Product Analytics (meets 5/5 core requirements). Bonus: SQL, A/B Testing, and MBA. Exceeds experience requirements (8 yrs vs 5 yrs required).',
    applied_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: 'Executive presentation went exceptionally well. Competitive offer sent.'
  },
  {
    id: 'app_12',
    candidate_id: 'cand_12', // Liam Zhang
    job_id: 'job_product',
    stage: 'interview',
    match_score: 92,
    match_explanation: 'Strong match on Product Management, Roadmapping, User Research, Agile, and Product Analytics (meets 5/5 core requirements). Bonus: SQL. Exceeds experience requirements (6 yrs vs 5 yrs required).',
    applied_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'app_13',
    candidate_id: 'cand_9', // Amina Diallo
    job_id: 'job_product',
    stage: 'rejected',
    match_score: 62,
    match_explanation: 'Strong overlap in User Research and Design (Figma), but candidate profile is strictly Product Design rather than technical Product Management. Lacks roadmapping & analytics metrics history.',
    applied_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    notes: 'Referred to design pipeline instead.'
  },

  // Frontend job
  {
    id: 'app_14',
    candidate_id: 'cand_4', // Jordan Miller
    job_id: 'job_frontend',
    stage: 'hired',
    match_score: 98,
    match_explanation: 'Exceptional match on React, TypeScript, Tailwind CSS, Next.js, and Figma (meets 5/5 core requirements). Proven design system leadership. Exceeds experience requirements (6 yrs vs 4 yrs required).',
    applied_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'app_15',
    candidate_id: 'cand_11', // Maya Patel
    job_id: 'job_frontend',
    stage: 'interview',
    match_score: 90,
    match_explanation: 'Strong match on React, Next.js, TypeScript, and Tailwind CSS (meets 4/5 core requirements). Missing: deep Figma design collaboration. Meets required 4 years experience.',
    applied_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'app_16',
    candidate_id: 'cand_15', // Chloe Bennett
    job_id: 'job_frontend',
    stage: 'screened',
    match_score: 94,
    match_explanation: 'Strong match on React, TypeScript, Next.js, Tailwind CSS, and Figma (meets 5/5 core requirements). Exceeds experience requirements (5 yrs vs 4 yrs required).',
    applied_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

const SEED_EVENTS: PipelineEvent[] = [
  {
    id: 'evt_1',
    application_id: 'app_1',
    from_stage: 'new',
    to_stage: 'applied',
    moved_by: 'usr_recruiter',
    moved_by_name: 'Marcus Vance',
    moved_at: new Date(Date.now() - 19 * 86400000).toISOString(),
    note: 'Resume parsed and auto-matched at 95%'
  },
  {
    id: 'evt_2',
    application_id: 'app_1',
    from_stage: 'applied',
    to_stage: 'screened',
    moved_by: 'usr_recruiter',
    moved_by_name: 'Marcus Vance',
    moved_at: new Date(Date.now() - 16 * 86400000).toISOString(),
    note: 'Completed initial phone screen'
  },
  {
    id: 'evt_3',
    application_id: 'app_1',
    from_stage: 'screened',
    to_stage: 'interview',
    moved_by: 'usr_interviewer',
    moved_by_name: 'David Chen',
    moved_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    note: 'Scheduled technical deep dive interview'
  },
  {
    id: 'evt_4',
    application_id: 'app_1',
    from_stage: 'interview',
    to_stage: 'offer',
    moved_by: 'usr_admin',
    moved_by_name: 'Elena Rostova',
    moved_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    note: 'Unanimous hire recommendation from engineering panel'
  },
  {
    id: 'evt_5',
    application_id: 'app_7',
    from_stage: 'offer',
    to_stage: 'hired',
    moved_by: 'usr_admin',
    moved_by_name: 'Elena Rostova',
    moved_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    note: 'Offer accepted! Welcome to the team.'
  }
];

const SEED_INTERVIEWS: Interview[] = [
  {
    id: 'int_1',
    application_id: 'app_2', // Tariq Al-Mansoor
    interviewer_id: 'usr_interviewer',
    interviewer_name: 'David Chen',
    scheduled_at: new Date(Date.now() + 2 * 86400000 + 4 * 3600000).toISOString(),
    duration_mins: 45,
    status: 'confirmed',
    notes: 'System architecture deep dive: distributed event queues and PostgreSQL scaling.',
    meet_link: 'https://meet.google.com/quitdroomscrolling-tariq-chen',
    proposed_slots: [
      {
        id: 'slot_1',
        start_time: new Date(Date.now() + 2 * 86400000 + 4 * 3600000).toISOString(),
        end_time: new Date(Date.now() + 2 * 86400000 + 4 * 3600000 + 45 * 60000).toISOString(),
        is_selected: true
      },
      {
        id: 'slot_2',
        start_time: new Date(Date.now() + 3 * 86400000 + 2 * 3600000).toISOString(),
        end_time: new Date(Date.now() + 3 * 86400000 + 2 * 3600000 + 45 * 60000).toISOString(),
        is_selected: false
      }
    ],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'int_2',
    application_id: 'app_8', // Emily Watson
    interviewer_id: 'usr_interviewer',
    interviewer_name: 'David Chen',
    duration_mins: 60,
    status: 'proposed',
    notes: 'Infrastructure live debugging and Terraform review.',
    meet_link: 'https://meet.google.com/quitdroomscrolling-emily-chen',
    proposed_slots: [
      {
        id: 'slot_3',
        start_time: new Date(Date.now() + 1 * 86400000 + 3 * 3600000).toISOString(),
        end_time: new Date(Date.now() + 1 * 86400000 + 4 * 3600000).toISOString()
      },
      {
        id: 'slot_4',
        start_time: new Date(Date.now() + 2 * 86400000 + 6 * 3600000).toISOString(),
        end_time: new Date(Date.now() + 2 * 86400000 + 7 * 3600000).toISOString()
      },
      {
        id: 'slot_5',
        start_time: new Date(Date.now() + 4 * 86400000 + 5 * 3600000).toISOString(),
        end_time: new Date(Date.now() + 4 * 86400000 + 6 * 3600000).toISOString()
      }
    ],
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load existing database file, seeding fresh state:', e);
    }
    const fresh: DatabaseSchema = {
      users: SEED_USERS,
      jobs: SEED_JOBS,
      candidates: SEED_CANDIDATES,
      applications: SEED_APPLICATIONS,
      pipeline_events: SEED_EVENTS,
      interviews: SEED_INTERVIEWS
    };
    this.save(fresh);
    return fresh;
  }

  public save(newData?: DatabaseSchema) {
    if (newData) {
      this.data = newData;
    }
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  // Getters
  public getUsers() { return this.data.users; }
  public getJobs() { return this.data.jobs; }
  public getCandidates() { return this.data.candidates; }
  public getApplications() { return this.data.applications; }
  public getPipelineEvents() { return this.data.pipeline_events; }
  public getInterviews() { return this.data.interviews; }

  // Setters / Mutators
  public addCandidate(candidate: Candidate) {
    this.data.candidates.unshift(candidate);
    this.save();
  }

  public updateCandidate(id: string, updates: Partial<Candidate>) {
    const idx = this.data.candidates.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.candidates[idx] = { ...this.data.candidates[idx], ...updates };
      this.save();
      return this.data.candidates[idx];
    }
    return null;
  }

  public addJob(job: Job) {
    this.data.jobs.unshift(job);
    this.save();
  }

  public updateJob(id: string, updates: Partial<Job>) {
    const idx = this.data.jobs.findIndex(j => j.id === id);
    if (idx !== -1) {
      this.data.jobs[idx] = { ...this.data.jobs[idx], ...updates };
      this.save();
      return this.data.jobs[idx];
    }
    return null;
  }

  public deleteJob(id: string) {
    this.data.jobs = this.data.jobs.filter(j => j.id !== id);
    this.save();
  }

  public addApplication(app: Application) {
    this.data.applications.unshift(app);
    this.save();
  }

  public updateApplication(id: string, updates: Partial<Application>) {
    const idx = this.data.applications.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.applications[idx] = { ...this.data.applications[idx], ...updates, updated_at: new Date().toISOString() };
      this.save();
      return this.data.applications[idx];
    }
    return null;
  }

  public addPipelineEvent(event: PipelineEvent) {
    this.data.pipeline_events.unshift(event);
    this.save();
  }

  public addInterview(interview: Interview) {
    this.data.interviews.unshift(interview);
    this.save();
  }

  public updateInterview(id: string, updates: Partial<Interview>) {
    const idx = this.data.interviews.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.data.interviews[idx] = { ...this.data.interviews[idx], ...updates };
      this.save();
      return this.data.interviews[idx];
    }
    return null;
  }
}

export const db = new Database();

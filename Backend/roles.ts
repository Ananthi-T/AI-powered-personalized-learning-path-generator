export type SkillGroup = {
  beginner: string[]
  intermediate: string[]
  advanced: string[]
}

export const ROLE_SKILLS: Record<string, SkillGroup> = {
  'Full-Stack Developer': {
    beginner: ['HTML', 'CSS', 'JavaScript', 'Git', 'Programming Fundamentals'],
    intermediate: ['React', 'Node.js', 'REST APIs', 'SQL', 'Authentication'],
    advanced: ['Next.js', 'System Design', 'Docker', 'Cloud Deployment', 'CI/CD']
  },
  'Frontend Developer': {
    beginner: ['HTML', 'CSS', 'JavaScript', 'Git', 'Accessibility Basics'],
    intermediate: ['React', 'TypeScript', 'State Management', 'Testing', 'Performance Basics'],
    advanced: ['Advanced React Patterns', 'Next.js', 'Web Performance', 'System Design', 'CI/CD']
  },
  'Backend Developer': {
    beginner: ['Programming Fundamentals', 'Git', 'HTTP & REST', 'Linux Basics', 'SQL Basics'],
    intermediate: ['Node.js', 'API Design', 'Authentication', 'Database Design', 'Caching'],
    advanced: ['Microservices', 'Message Queues', 'System Design', 'Docker', 'Cloud Deployment']
  },
  'Data Scientist': {
    beginner: ['Python', 'Data Wrangling', 'Statistics Basics', 'Git', 'SQL'],
    intermediate: ['Pandas', 'NumPy', 'Visualization', 'ML Fundamentals', 'Model Evaluation'],
    advanced: ['Deep Learning', 'Big Data', 'MLOps', 'System Design', 'Cloud Deployment']
  },
  'AI Engineer': {
    beginner: ['Python', 'Linear Algebra Basics', 'Probability Basics', 'Git', 'SQL'],
    intermediate: ['PyTorch Basics', 'Model Training', 'Feature Engineering', 'Evaluation', 'Deployment Basics'],
    advanced: ['LLMs', 'Vector Databases', 'MLOps', 'System Design', 'Cloud Deployment']
  }
}

function normalizeRole(goalRaw: string): string {
  const goal = (goalRaw || '').toLowerCase()
  if (/front/i.test(goal)) return 'Frontend Developer'
  if (/back/i.test(goal)) return 'Backend Developer'
  if (/full.?stack/i.test(goal)) return 'Full-Stack Developer'
  if (/data scientist|data\s*science/i.test(goal)) return 'Data Scientist'
  if (/ai|ml|machine learning/i.test(goal)) return 'AI Engineer'
  return 'Full-Stack Developer'
}

function extractWeeklyHours(weeklyLearningTime?: string): number {
  const num = Number(String(weeklyLearningTime || '').match(/\d+/)?.[0] || 6)
  if (String(weeklyLearningTime || '').includes('10+')) return 10
  return Math.max(3, Math.min(20, num || 6))
}

export function computeSnapshot(params: {
  careerGoal: string
  knownSkills: string[]
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced'
  weeklyLearningTime?: string
}) {
  // compatibility key to match instruction
  if (!ROLE_SKILLS['Full Stack Developer']) {
    ROLE_SKILLS['Full Stack Developer'] = ROLE_SKILLS['Full-Stack Developer']
  }
  const targetRole = normalizeRole(params.careerGoal || '')
  const groups = ROLE_SKILLS[targetRole]
  const known = new Set((params.knownSkills || []).map(s => s.toLowerCase()))

  const groupWeights = { beginner: 1, intermediate: 2, advanced: 3 }
  const levelFactor = params.skillLevel === 'Advanced' ? 1.0 : params.skillLevel === 'Intermediate' ? 0.75 : 0.5

  const totalWeighted = 
    groups.beginner.length * groupWeights.beginner +
    groups.intermediate.length * groupWeights.intermediate +
    groups.advanced.length * groupWeights.advanced

  const matchedWeighted =
    groups.beginner.filter(s => known.has(s.toLowerCase())).length * groupWeights.beginner +
    groups.intermediate.filter(s => known.has(s.toLowerCase())).length * groupWeights.intermediate +
    groups.advanced.filter(s => known.has(s.toLowerCase())).length * groupWeights.advanced

  const basePercent = totalWeighted ? (matchedWeighted / totalWeighted) : 0
  const readinessScore = Math.max(0, Math.min(100, Math.round(basePercent * 100 * levelFactor)))

  const missingSkills: SkillGroup = {
    beginner: groups.beginner.filter(s => !known.has(s.toLowerCase())),
    intermediate: groups.intermediate.filter(s => !known.has(s.toLowerCase())),
    advanced: groups.advanced.filter(s => !known.has(s.toLowerCase()))
  }

  const hoursPerSkill = { beginner: 10, intermediate: 20, advanced: 30 }
  const totalHours =
    missingSkills.beginner.length * hoursPerSkill.beginner +
    missingSkills.intermediate.length * hoursPerSkill.intermediate +
    missingSkills.advanced.length * hoursPerSkill.advanced

  const weeklyHours = extractWeeklyHours(params.weeklyLearningTime)
  const estimatedMonths = Math.max(1, Math.ceil(totalHours / Math.max(1, weeklyHours) / 4))

  return {
    targetRole,
    readinessScore,
    missingSkills,
    estimatedMonths
  }
}

export const calculateSnapshot = computeSnapshot

export function getCareerSnapshot(role: string, userSkills: Record<string, string | undefined>) {
  const group = ROLE_SKILLS[role] || ROLE_SKILLS['Full-Stack Developer']
  const required = [
    ...(group?.beginner || []),
    ...(group?.intermediate || []),
    ...(group?.advanced || [])
  ]
  const missing_skills = required.filter(skill => !userSkills[skill] || userSkills[skill] === 'None')
  // debug confirmation
  console.log(missing_skills)
  return { missing_skills }
}

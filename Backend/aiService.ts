import { GoogleGenAI } from '@google/genai'
import { RoleOntologyModel } from '../models/RoleOntology'
import { findOne, create as storeCreate, useDB } from '../lib/store'

export class AIService {
  private apiKey: string
  private model: string
  private ai: GoogleGenAI | null
  private roleCache: Map<
    string,
    {
      beginner: string[]
      intermediate: string[]
      advanced: string[]
    }
  >
  private ontologyCache: Map<string, any>

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || ''
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

    this.ai = this.apiKey
      ? new GoogleGenAI({ apiKey: this.apiKey })
      : null

    this.roleCache = new Map()
    this.ontologyCache = new Map()
  }

  // =========================================================
  // BASIC GEMINI REQUEST
  // =========================================================

  private async askGemini(
    systemInstruction: string,
    userMessage: string,
    jsonMode: boolean = false
  ): Promise<string> {
    if (!this.ai) {
      throw new Error('GEMINI_API_KEY is missing')
    }

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.2,
        ...(jsonMode
          ? {
              responseMimeType: 'application/json'
            }
          : {})
      }
    })

    const text = response.text

    if (!text) {
      throw new Error('Gemini returned an empty response')
    }

    return text.trim()
  }

  private async askGeminiJson<T>(
    systemInstruction: string,
    userMessage: string
  ): Promise<T> {
    return JSON.parse(
      await this.askGemini(systemInstruction, userMessage, true)
    ) as T
  }

  // =========================================================
  // VALIDATE GEMINI KEY
  // =========================================================

  private hasGemini(): boolean {
    return Boolean(this.apiKey && this.apiKey !== 'YOUR_API_KEY_HERE')
  }

  // =========================================================
  // GENERATE PATH FROM SNAPSHOT
  // =========================================================

  async generatePathFromSnapshot(input: {
    missingSkills: {
      beginner: string[]
      intermediate: string[]
      advanced: string[]
    }
    mode: 'fastTrack' | 'balanced' | 'deepDive'
    weeklyHours?: number
  }): Promise<{
    mode: 'fastTrack' | 'balanced' | 'deepDive'
    totalDuration: string
    learningPath: {
      skill: string
      level: 'beginner' | 'intermediate' | 'advanced'
      tasks: string[]
      project: string
    }[]
  }> {
    const weekly = Math.max(
      3,
      Math.min(20, input.weeklyHours || 6)
    )

    const b = Array.isArray(input.missingSkills?.beginner)
      ? input.missingSkills.beginner
      : []

    const i = Array.isArray(input.missingSkills?.intermediate)
      ? input.missingSkills.intermediate
      : []

    const a = Array.isArray(input.missingSkills?.advanced)
      ? input.missingSkills.advanced
      : []

    const ordered: {
      skill: string
      level: 'beginner' | 'intermediate' | 'advanced'
    }[] = []

    if (input.mode === 'fastTrack') {
      i.forEach(s =>
        ordered.push({
          skill: s,
          level: 'intermediate'
        })
      )

      a.forEach(s =>
        ordered.push({
          skill: s,
          level: 'advanced'
        })
      )
    } else {
      b.forEach(s =>
        ordered.push({
          skill: s,
          level: 'beginner'
        })
      )

      i.forEach(s =>
        ordered.push({
          skill: s,
          level: 'intermediate'
        })
      )

      a.forEach(s =>
        ordered.push({
          skill: s,
          level: 'advanced'
        })
      )
    }

    if (ordered.length === 0) {
      return {
        mode: input.mode,
        totalDuration: '0 weeks',
        learningPath: [
          {
            skill: 'Career Ready 🎉',
            level: 'beginner',
            tasks: [
              'Maintain portfolio',
              'Prepare for interviews'
            ],
            project: 'Polish resume and GitHub'
          }
        ]
      }
    }

    const hoursMapFast = {
      beginner: 0,
      intermediate: 10,
      advanced: 14
    }

    const hoursMapBalanced = {
      beginner: 8,
      intermediate: 14,
      advanced: 20
    }

    const hoursMapDeep = {
      beginner: 10,
      intermediate: 18,
      advanced: 26
    }

    const hoursFor = (
      lvl: 'beginner' | 'intermediate' | 'advanced'
    ) => {
      if (input.mode === 'fastTrack') {
        return hoursMapFast[lvl]
      }

      if (input.mode === 'balanced') {
        return hoursMapBalanced[lvl]
      }

      return hoursMapDeep[lvl]
    }

    const tasksFor = (
      skill: string,
      lvl: 'beginner' | 'intermediate' | 'advanced'
    ): string[] => {
      if (input.mode === 'fastTrack') {
        return [
          `Implement ${skill} in a practical mini feature`,
          `Validate ${skill} with a small integration test`
        ]
      }

      if (input.mode === 'balanced') {
        return [
          `Read official documentation for ${skill}`,
          `Build a small project using ${skill}`
        ]
      }

      return [
        `Deep dive theory: core concepts of ${skill}`,
        `Hands-on lab: advanced patterns in ${skill}`,
        `Performance and testing for ${skill}`
      ]
    }

    const projectFor = (
      skill: string,
      lvl: 'beginner' | 'intermediate' | 'advanced'
    ): string => {
      if (input.mode === 'fastTrack') {
        return `Capstone: Ship a job-ready feature using ${skill}`
      }

      if (input.mode === 'balanced') {
        if (lvl === 'beginner') {
          return `Project: Fundamentals app showcasing ${skill}`
        }

        if (lvl === 'intermediate') {
          return `Project: Real-world module built with ${skill}`
        }

        return `Project: Systems-focused implementation of ${skill}`
      }

      return `Mastery: Two-phase project exploring ${skill} end-to-end`
    }

    const totalHours = ordered.reduce(
      (sum, s) => sum + hoursFor(s.level),
      0
    )

    const totalWeeks = Math.max(
      1,
      Math.ceil(totalHours / weekly)
    )

    const learningPath = ordered.map(s => ({
      skill: s.skill,
      level: s.level,
      tasks: tasksFor(s.skill, s.level),
      project: projectFor(s.skill, s.level)
    }))

    return {
      mode: input.mode,
      totalDuration: `${totalWeeks} weeks`,
      learningPath
    }
  }

  // =========================================================
  // GENERATE ROLE ONTOLOGY
  // =========================================================

  async generateRoleOntology(
    careerRole: string
  ): Promise<{
    role: string
    skills: {
      skillName: string
      level: 'beginner' | 'intermediate' | 'advanced'
      prerequisites: string[]
      unlocks: string[]
      importanceWeight: number
    }[]
  }> {
    const key = (careerRole || '').toLowerCase().trim()

    const cached = this.ontologyCache.get(key)

    if (cached) {
      return cached
    }

    const hasKey = this.hasGemini()

    const system = `
You are an expert career ontology generator.

Generate a realistic and industry-relevant skill ontology for the requested career role.

Return ONLY valid JSON.

Every skill must contain:
- skillName
- level
- prerequisites
- unlocks
- importanceWeight

level must be one of:
beginner
intermediate
advanced

importanceWeight must be between 1 and 3.

Return this exact structure:

{
  "role": "",
  "skills": [
    {
      "skillName": "",
      "level": "beginner",
      "prerequisites": [],
      "unlocks": [],
      "importanceWeight": 2
    }
  ]
}

`

    const userMsg = `
Generate a complete skill ontology for this career role:

${careerRole}

Include the most important skills required by companies today.
Make prerequisites logical.
Make unlocks logical.
Do not include duplicate skills.
`

    if (hasKey) {
      try {
        const parsed = await this.askGeminiJson<{
          role: string
          skills: {
            skillName: string
            level: 'beginner' | 'intermediate' | 'advanced'
            prerequisites: string[]
            unlocks: string[]
            importanceWeight: number
          }[]
        }>(
          system,
          userMsg
        )

        if (
          parsed?.role &&
          Array.isArray(parsed?.skills)
        ) {
          this.ontologyCache.set(key, parsed)
          return parsed
        }
      } catch (error) {
        console.error(
          'Gemini Role Ontology Error:',
          error
        )
      }
    }

    const baseline = [
      {
        skillName: 'Programming Fundamentals',
        level: 'beginner' as const,
        prerequisites: [],
        unlocks: ['Data Structures'],
        importanceWeight: 2
      },
      {
        skillName: 'Data Structures',
        level: 'beginner' as const,
        prerequisites: ['Programming Fundamentals'],
        unlocks: ['Algorithms'],
        importanceWeight: 2
      },
      {
        skillName: 'Algorithms',
        level: 'intermediate' as const,
        prerequisites: ['Data Structures'],
        unlocks: ['System Design'],
        importanceWeight: 2
      },
      {
        skillName: 'System Design',
        level: 'advanced' as const,
        prerequisites: ['Algorithms'],
        unlocks: [],
        importanceWeight: 3
      }
    ]

    const roleSpecificBoost = (name: string) => {
      const low = name.toLowerCase()

      if (/front/.test(low)) {
        return [
          {
            skillName: 'HTML',
            level: 'beginner' as const,
            prerequisites: [],
            unlocks: ['CSS', 'Accessibility'],
            importanceWeight: 1
          },
          {
            skillName: 'CSS',
            level: 'beginner' as const,
            prerequisites: ['HTML'],
            unlocks: ['Responsive Design'],
            importanceWeight: 1
          },
          {
            skillName: 'JavaScript',
            level: 'beginner' as const,
            prerequisites: ['HTML', 'CSS'],
            unlocks: ['React', 'TypeScript'],
            importanceWeight: 2
          },
          {
            skillName: 'React',
            level: 'intermediate' as const,
            prerequisites: ['JavaScript'],
            unlocks: ['Advanced React Patterns'],
            importanceWeight: 2
          }
        ]
      }

      if (/back/.test(low)) {
        return [
          {
            skillName: 'HTTP & REST',
            level: 'beginner' as const,
            prerequisites: [],
            unlocks: ['API Design'],
            importanceWeight: 1
          },
          {
            skillName: 'Node.js',
            level: 'intermediate' as const,
            prerequisites: ['JavaScript'],
            unlocks: ['Authentication', 'Database Design'],
            importanceWeight: 2
          },
          {
            skillName: 'Database Design',
            level: 'intermediate' as const,
            prerequisites: ['SQL Basics'],
            unlocks: ['Caching'],
            importanceWeight: 2
          }
        ]
      }

      if (/data\s*scient/.test(low)) {
        return [
          {
            skillName: 'Python',
            level: 'beginner' as const,
            prerequisites: [],
            unlocks: ['Pandas', 'NumPy'],
            importanceWeight: 2
          },
          {
            skillName: 'Statistics',
            level: 'beginner' as const,
            prerequisites: [],
            unlocks: ['Model Evaluation'],
            importanceWeight: 2
          },
          {
            skillName: 'ML Fundamentals',
            level: 'intermediate' as const,
            prerequisites: ['Python', 'Statistics'],
            unlocks: ['Deep Learning'],
            importanceWeight: 2
          }
        ]
      }

      if (/ai|ml|machine\s*learning/.test(low)) {
        return [
          {
            skillName: 'Python',
            level: 'beginner' as const,
            prerequisites: [],
            unlocks: ['PyTorch'],
            importanceWeight: 2
          },
          {
            skillName: 'PyTorch',
            level: 'intermediate' as const,
            prerequisites: ['Python'],
            unlocks: ['Model Training'],
            importanceWeight: 2
          },
          {
            skillName: 'System Design',
            level: 'advanced' as const,
            prerequisites: ['PyTorch'],
            unlocks: ['MLOps'],
            importanceWeight: 3
          }
        ]
      }

      return []
    }

    const skills = [
      ...baseline,
      ...roleSpecificBoost(careerRole)
    ]

    const ontology = {
      role: careerRole,
      skills
    }

    this.ontologyCache.set(key, ontology)

    return ontology
  }

  // =========================================================
  // GENERATE ROLE SKILLS
  // =========================================================

  async generateRoleSkills(
    careerGoal: string
  ): Promise<{
    beginner: string[]
    intermediate: string[]
    advanced: string[]
  }> {
    const key = (careerGoal || '').toLowerCase().trim()

    const cached = this.roleCache.get(key)

    if (cached) {
      return cached
    }

    const mock = {
      beginner: [
        'Programming Basics',
        'Git',
        'Networking'
      ],
      intermediate: [
        'React',
        'Node.js',
        'Databases'
      ],
      advanced: [
        'System Design',
        'Security Auditing'
      ]
    }

    if (!this.hasGemini()) {
      this.roleCache.set(key, mock)
      return mock
    }

    const system = `
You are an industry expert career coach.

Identify the skills required for the given career role.

Group skills into:
Beginner
Intermediate
Advanced

Return ONLY valid JSON.

Format:

{
  "Beginner": [],
  "Intermediate": [],
  "Advanced": []
}
`

    const userMsg = `
Career Role:
${careerGoal}

Give the most important skills needed to become job-ready.
Avoid duplicate skills.
`

    try {
      const parsed = await this.askGeminiJson<{
        Beginner?: unknown
        Intermediate?: unknown
        Advanced?: unknown
      }>(
        system,
        userMsg
      )

      const result = {
        beginner: Array.isArray(parsed.Beginner)
          ? parsed.Beginner
          : [],
        intermediate: Array.isArray(parsed.Intermediate)
          ? parsed.Intermediate
          : [],
        advanced: Array.isArray(parsed.Advanced)
          ? parsed.Advanced
          : []
      }

      this.roleCache.set(key, result)

      return result
    } catch (error) {
      console.error(
        'Gemini Role Skills Error:',
        error
      )

      this.roleCache.set(key, mock)

      return mock
    }
  }

  // =========================================================
  // GENERATE THREE LEARNING PATHS
  // =========================================================

  async generateThreeLearningPaths(params: {
    careerRole: string
    knownSkills: string[]
    weeklyHours?: number
  }): Promise<{
    fastTrack: {
      totalDuration: string
      skills: string[]
      dailyTasks: {
        type: string
        title: string
        description: string
        estimatedMinutes: number
      }[]
      projects: {
        title: string
        description: string
        difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
      }[]
    }
    balanced: {
      totalDuration: string
      skills: string[]
      dailyTasks: {
        type: string
        title: string
        description: string
        estimatedMinutes: number
      }[]
      projects: {
        title: string
        description: string
        difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
      }[]
    }
    deepDive: {
      totalDuration: string
      skills: string[]
      dailyTasks: {
        type: string
        title: string
        description: string
        estimatedMinutes: number
      }[]
      projects: {
        title: string
        description: string
        difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
      }[]
    }
  }> {
    const role = params.careerRole

    const weeklyHours = Math.max(
      3,
      Math.min(20, params.weeklyHours || 6)
    )

    const norm = (s: string) =>
      (s || '').toLowerCase().trim()

    const knownSet = new Set(
      (params.knownSkills || []).map(norm)
    )

    let ontology: any = await findOne(
      'RoleOntology',
      { role }
    )

    if (!ontology) {
      const generated =
        await this.generateRoleOntology(role)

      try {
        const connected = await useDB()

        if (connected) {
          const created =
            await RoleOntologyModel.create({
              role: generated.role,
              skills: generated.skills
            })

          ontology = (created as any).toObject()
        } else {
          ontology = await storeCreate(
            'RoleOntology',
            {
              role: generated.role,
              skills: generated.skills
            }
          )
        }
      } catch {
        ontology = {
          role: generated.role,
          skills: generated.skills
        }
      }
    }

    const skills = ontology?.skills || []

    const missing = skills.filter(
      (s: any) =>
        !knownSet.has(norm(s.skillName))
    )

    const byName = new Map<string, any>(
      skills.map((s: any) => [
        norm(s.skillName),
        s
      ])
    )

    const levelToDifficulty = (
      lvl:
        | 'beginner'
        | 'intermediate'
        | 'advanced'
    ): 'Beginner' | 'Intermediate' | 'Advanced' => {
      if (lvl === 'beginner') return 'Beginner'
      if (lvl === 'intermediate') return 'Intermediate'
      return 'Advanced'
    }

    function topoOrder(
      include: Set<string>
    ) {
      const names = Array.from(include)

      const prereqMap =
        new Map<string, string[]>()

      names.forEach(n => {
        const s = byName.get(n)

        const deps = (
          s?.prerequisites || []
        )
          .map(norm)
          .filter((d: string) =>
            include.has(d)
          )

        prereqMap.set(n, deps)
      })

      const indeg =
        new Map<string, number>()

      names.forEach(n =>
        indeg.set(n, 0)
      )

      for (const [n, deps] of prereqMap) {
        deps.forEach(d =>
          indeg.set(
            n,
            (indeg.get(n) || 0) + 1
          )
        )
      }

      const queue: string[] = []

      for (const [n, d] of indeg) {
        if (d === 0) {
          queue.push(n)
        }
      }

      const ordered: string[] = []

      while (queue.length) {
        const n = queue.shift()!

        ordered.push(n)

        for (const [m, deps] of prereqMap) {
          if (deps.includes(n)) {
            indeg.set(
              m,
              (indeg.get(m) || 1) - 1
            )

            if (
              (indeg.get(m) || 0) === 0
            ) {
              queue.push(m)
            }
          }
        }
      }

      return ordered
    }

    const fastList = missing
      .filter(
        (s: any) =>
          (s.importanceWeight || 1) >= 2
      )
      .map((s: any) =>
        norm(s.skillName)
      )

    const balancedInclude =
      new Set<string>([
        ...missing.map((s: any) =>
          norm(s.skillName)
        ),

        ...missing.flatMap(
          (s: any) =>
            (s.prerequisites || [])
              .map(norm)
              .filter(
                (p: string) =>
                  byName.has(p) &&
                  !knownSet.has(p)
              )
        )
      ])

    const deepInclude =
      new Set<string>(
        skills.map((s: any) =>
          norm(s.skillName)
        )
      )

    const fastOrdered = fastList

    const balancedOrdered =
      topoOrder(balancedInclude)

    const deepOrdered =
      topoOrder(deepInclude)

    const hoursFast = (
      lvl:
        | 'beginner'
        | 'intermediate'
        | 'advanced'
    ) =>
      lvl === 'beginner'
        ? 6
        : lvl === 'intermediate'
        ? 10
        : 14

    const hoursBalanced = (
      lvl:
        | 'beginner'
        | 'intermediate'
        | 'advanced'
    ) =>
      lvl === 'beginner'
        ? 8
        : lvl === 'intermediate'
        ? 14
        : 20

    const hoursDeep = (
      lvl:
        | 'beginner'
        | 'intermediate'
        | 'advanced'
    ) =>
      lvl === 'beginner'
        ? 10
        : lvl === 'intermediate'
        ? 18
        : 26

    const sumHours = (
      names: string[],
      hoursFn: (lvl: any) => number
    ) =>
      names.reduce(
        (sum, n) =>
          sum +
          hoursFn(
            byName.get(n)?.level ||
              'beginner'
          ),
        0
      )

    const weeks = (
      totalHours: number
    ) =>
      `${Math.max(
        1,
        Math.ceil(
          totalHours / weeklyHours
        )
      )} weeks`

    function makeDailyTasks(
      names: string[],
      mode: 'fast' | 'balanced' | 'deep'
    ) {
      const base = names
        .slice(0, 5)
        .map(
          n =>
            byName.get(n)?.skillName ||
            n
        )

      const minutes =
        mode === 'fast'
          ? [15, 20, 30, 20]
          : mode === 'balanced'
          ? [20, 25, 45, 25]
          : [25, 30, 60, 30]

      return base.flatMap(skill => [
        {
          type: 'Watch',
          title: `Watch intro: ${skill}`,
          description: `Overview and key concepts for ${skill}`,
          estimatedMinutes: minutes[0]
        },
        {
          type: 'Read',
          title: `Read docs: ${skill}`,
          description: `Official documentation and best practices for ${skill}`,
          estimatedMinutes: minutes[1]
        },
        {
          type: 'Build',
          title: `Build mini-project: ${skill}`,
          description: `Hands-on exercise implementing ${skill}`,
          estimatedMinutes: minutes[2]
        },
        {
          type: 'Reflect',
          title: `Reflect on ${skill}`,
          description: `Write notes and plan next steps`,
          estimatedMinutes: minutes[3]
        }
      ])
    }

    function makeProjects(
      names: string[],
      mode: 'fast' | 'balanced' | 'deep'
    ) {
      const arr: {
        title: string
        description: string
        difficulty:
          | 'Beginner'
          | 'Intermediate'
          | 'Advanced'
      }[] = []

      names.forEach(n => {
        const s = byName.get(n)

        const diff =
          levelToDifficulty(
            s?.level || 'beginner'
          )

        const baseTitle =
          `${s?.skillName} Project`

        if (mode === 'fast') {
          if (
            (s?.importanceWeight || 1) >=
            2
          ) {
            arr.push({
              title: baseTitle,
              description:
                `Practical job-ready implementation of ${s?.skillName}`,
              difficulty: diff
            })
          }
        } else if (
          mode === 'balanced'
        ) {
          arr.push({
            title: baseTitle,
            description:
              `One solid project covering core aspects of ${s?.skillName}`,
            difficulty: diff
          })
        } else {
          arr.push(
            {
              title: `${baseTitle} I`,
              description:
                `Foundational implementation for ${s?.skillName}`,
              difficulty: diff
            },
            {
              title: `${baseTitle} II`,
              description:
                `Advanced patterns and performance for ${s?.skillName}`,
              difficulty:
                diff === 'Beginner'
                  ? 'Intermediate'
                  : 'Advanced'
            }
          )
        }
      })

      return arr
    }

    const fastHours = sumHours(
      fastOrdered,
      hoursFast
    )

    const balancedHours = sumHours(
      balancedOrdered,
      hoursBalanced
    )

    const deepHours = sumHours(
      deepOrdered,
      hoursDeep
    )

    return {
      fastTrack: {
        totalDuration:
          weeks(fastHours),
        skills: fastOrdered.map(
          n =>
            byName.get(n)?.skillName ||
            n
        ),
        dailyTasks:
          makeDailyTasks(
            fastOrdered,
            'fast'
          ),
        projects:
          makeProjects(
            fastOrdered,
            'fast'
          )
      },

      balanced: {
        totalDuration:
          weeks(balancedHours),
        skills: balancedOrdered.map(
          n =>
            byName.get(n)?.skillName ||
            n
        ),
        dailyTasks:
          makeDailyTasks(
            balancedOrdered,
            'balanced'
          ),
        projects:
          makeProjects(
            balancedOrdered,
            'balanced'
          )
      },

      deepDive: {
        totalDuration:
          weeks(deepHours),
        skills: deepOrdered.map(
          n =>
            byName.get(n)?.skillName ||
            n
        ),
        dailyTasks:
          makeDailyTasks(
            deepOrdered,
            'deep'
          ),
        projects:
          makeProjects(
            deepOrdered,
            'deep'
          )
      }
    }
  }

  // =========================================================
  // MOCK RESPONSE
  // =========================================================

  private getMockResponse(
    context: string
  ) {
    console.warn(
      '⚠️ AI Service: Using MOCK response (Gemini API Key missing)'
    )

    const isFrontend =
      /frontend|react|javascript|css/i.test(
        context
      )

    const isBackend =
      /backend|node|python|java|sql/i.test(
        context
      )

    const isData =
      /data|science|python|analysis/i.test(
        context
      )

    let targetRole =
      'Full Stack Developer'

    let missingSkills = {
      beginner: [
        'HTML & Semantic Markup',
        'CSS Fundamentals',
        'JavaScript Basics',
        'Git & Version Control',
        'Programming Fundamentals'
      ],

      intermediate: [
        'React Fundamentals',
        'Backend API Basics',
        'Database Basics',
        'Authentication Basics',
        'State Management'
      ],

      advanced: [
        'Next.js Advanced Patterns',
        'API Performance Optimization',
        'System Design',
        'Docker',
        'Cloud Deployment',
        'CI/CD Pipelines'
      ]
    }

    if (isFrontend) {
      targetRole =
        'Senior Frontend Engineer'

      missingSkills = {
        beginner: [
          'HTML & Semantic Markup',
          'CSS Fundamentals',
          'JavaScript Basics',
          'Git & Version Control',
          'Programming Fundamentals'
        ],

        intermediate: [
          'React Fundamentals',
          'State Management',
          'Authentication Basics',
          'Accessibility Basics',
          'TypeScript Basics'
        ],

        advanced: [
          'Advanced React Patterns',
          'Web Performance Optimization',
          'Next.js Advanced Patterns',
          'System Design',
          'CI/CD Pipelines'
        ]
      }
    } else if (isBackend) {
      targetRole =
        'Backend Systems Architect'

      missingSkills = {
        beginner: [
          'Programming Fundamentals',
          'Git & Version Control',
          'HTTP & REST',
          'Linux Basics',
          'SQL Basics'
        ],

        intermediate: [
          'Node.js Basics',
          'API Design',
          'Authentication Basics',
          'Database Design',
          'Caching'
        ],

        advanced: [
          'Microservices',
          'Message Queues',
          'System Design',
          'Docker',
          'Kubernetes',
          'Cloud Deployment'
        ]
      }
    } else if (isData) {
      targetRole =
        'Data Scientist'

      missingSkills = {
        beginner: [
          'Python Basics',
          'Data Wrangling',
          'Statistics Basics',
          'Git & Version Control',
          'SQL Basics'
        ],

        intermediate: [
          'Pandas & NumPy',
          'Visualization',
          'ML Fundamentals',
          'Feature Engineering',
          'Model Evaluation'
        ],

        advanced: [
          'Deep Learning',
          'Big Data Processing',
          'MLOps Pipelines',
          'System Design',
          'Cloud Deployment'
        ]
      }
    }

    return {
      targetRole,
      readinessScore: 65,
      missingSkills,
      estimatedMonths: 4
    }
  }

  // =========================================================
  // GENERATE CAREER SNAPSHOT
  // =========================================================

  async generateCareerSnapshot(
    profileContext: string
  ) {
    if (!this.hasGemini()) {
      return this.getMockResponse(
        profileContext
      )
    }

    const system = `
You are an advanced AI Career Intelligence Engine.

Analyze the user's profile carefully.

Return ONLY valid JSON.

Do not add markdown.
Do not add explanations outside JSON.

Return useful, realistic and personalized career information.
`

    try {
      return await this.askGeminiJson<Record<string, unknown>>(
        system,
        profileContext
      )
    } catch (error: any) {
      console.error(
        'Gemini Career Snapshot Error:',
        error
      )

      return this.getMockResponse(
        profileContext
      )
    }
  }

  // =========================================================
  // GENERATE SNAPSHOT DETAILS
  // =========================================================

  async generateSnapshotDetails(
    context: string
  ) {
    if (!this.hasGemini()) {
      return this.getMockSnapshotDetails(
        context
      )
    }

    const system = `
You are an expert AI Career Coach.

Analyze the user's career information and create a practical learning plan.

Return ONLY valid JSON.

Use this structure:

{
  "learning_path": [
    {
      "skill": "",
      "duration": ""
    }
  ],
  "daily_micro_tasks": [
    {
      "day": 1,
      "task": ""
    }
  ],
  "skill_validation": [],
  "estimated_total_time": ""
}

Make the answer personalized and job-oriented.
`

    try {
      return await this.askGeminiJson<Record<string, unknown>>(
        system,
        context
      )
    } catch (error: any) {
      console.error(
        'Gemini Snapshot Details Error:',
        error
      )

      return this.getMockSnapshotDetails(
        context
      )
    }
  }

  // =========================================================
  // MOCK SNAPSHOT DETAILS
  // =========================================================

  private getMockSnapshotDetails(
    context: string
  ) {
    const skills = [
      'Git',
      'React',
      'Node.js',
      'Express.js',
      'MongoDB',
      'SQL'
    ]

    const learning_path =
      skills.map(skill => {
        const low =
          skill.toLowerCase()

        const duration =
          low.includes('git')
            ? '1 week'
            : low.includes('react')
            ? '3 weeks'
            : low.includes('node')
            ? '3 weeks'
            : low.includes('express')
            ? '2 weeks'
            : low.includes('mongo')
            ? '2 weeks'
            : low.includes('sql')
            ? '2 weeks'
            : '2 weeks'

        return {
          skill,
          duration
        }
      })

    return {
      learning_path,

      daily_micro_tasks: [
        {
          day: 1,
          task: 'Learn Git basics and push a sample repo to GitHub'
        },
        {
          day: 2,
          task: 'Build a simple React component with props and state'
        },
        {
          day: 3,
          task: 'Create a REST API using Node.js and Express'
        },
        {
          day: 4,
          task: 'Connect MongoDB and perform CRUD operations'
        },
        {
          day: 5,
          task: 'Integrate React frontend with backend API'
        },
        {
          day: 6,
          task: 'Add authentication with login and signup'
        },
        {
          day: 7,
          task: 'Deploy the full-stack application'
        }
      ],

      skill_validation: [
        'Build and deploy a full-stack MERN application',
        'Publish code on GitHub with README',
        'Host the app using Render or Vercel'
      ],

      estimated_total_time: '4 Months'
    }
  }
}

export const aiService = new AIService()


  
 
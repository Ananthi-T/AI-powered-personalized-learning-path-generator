import { NextResponse } from 'next/server'
import { generateLearningPath } from '../../../lib/ai'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { profile } = body || {}
    let steps: any[] = []
    try {
      steps = generateLearningPath(profile)
    } catch (genErr) {
      console.error('generate-path gen error:', genErr)
    }
    if (!Array.isArray(steps) || steps.length === 0) {
      steps = [
        { id: 'gp-1', title: 'Profile Discovery', description: 'Document current skills, experience, and career objectives', type: 'assessment' },
        { id: 'gp-2', title: 'Gap Analysis', description: 'Compare current profile against target role requirements', type: 'analysis' },
        { id: 'gp-3', title: 'Foundational Skill Building', description: 'Develop core technical and soft skills foundation', type: 'learning' },
        { id: 'gp-4', title: 'Applied Practice', description: 'Build portfolio projects and complete coding challenges', type: 'practice' },
        { id: 'gp-5', title: 'Validation & Certification', description: 'Validate mastery through assessments and earn certificates', type: 'validation' },
        { id: 'gp-6', title: 'Interview & Job Search Prep', description: 'Prepare for interviews, optimize resume, and apply strategically', type: 'preparation' }
      ]
    }
    return NextResponse.json({ steps })
  } catch (e) {
    console.error(e)
    return NextResponse.json({
      steps: [
        { id: 'gp-fb-1', title: 'Profile Discovery', description: 'Document and organize current skills, experience, and career objectives', type: 'assessment' },
        { id: 'gp-fb-2', title: 'Gap Analysis', description: 'Compare current profile against industry-standard target role requirements', type: 'analysis' },
        { id: 'gp-fb-3', title: 'Foundational Skill Building', description: 'Develop core technical and soft skills through structured learning', type: 'learning' },
        { id: 'gp-fb-4', title: 'Applied Practice', description: 'Build a compelling portfolio of projects and complete coding challenges', type: 'practice' },
        { id: 'gp-fb-5', title: 'Validation & Certification', description: 'Validate skill mastery through assessments and earn shareable certificates', type: 'validation' },
        { id: 'gp-fb-6', title: 'Interview & Job Search Prep', description: 'Prepare for interviews, optimize resume and LinkedIn, and apply strategically', type: 'preparation' }
      ]
    })
  }
}

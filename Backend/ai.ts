export function generateLearningPath(profile: any) {
  const goal = profile?.careerGoal || 'your goal'
  const level = profile?.skillLevel || 'Beginner'
  const time = profile?.weeklyLearningTime || '4-6h'
  return [
    { 
      title: `Orientation: PathWise overview for ${goal}`, 
      duration: '1 day',
      description: 'Introduction to the learning path, setting up your environment, and understanding the core competencies required.'
    },
    { 
      title: `Foundations: Core concepts (${level})`, 
      duration: `${time} / week`,
      description: `Mastering the fundamental skills and theories necessary for ${goal} at a ${level} level.`
    },
    { 
      title: `Practice: Guided projects aligned to ${goal}`, 
      duration: `${time} / week`,
      description: 'Hands-on practice with real-world scenarios to reinforce your learning and build muscle memory.'
    },
    { 
      title: `Deepen: Advanced topics and resources`, 
      duration: `${time} / week`,
      description: 'Exploring complex subjects, optimization techniques, and industry best practices.'
    },
    { 
      title: `Milestone: Build portfolio piece for ${goal}`, 
      duration: '2 weeks',
      description: 'Creating a significant project that demonstrates your skills and can be showcased to potential employers.'
    },
    { 
      title: `Capstone: Present outcomes and next steps`, 
      duration: '1 week',
      description: 'Final review of your progress, preparing for interviews, and planning your continued growth.'
    }
  ]
}


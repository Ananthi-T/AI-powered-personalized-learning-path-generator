export function validateSignup({ name, email, password, confirmPassword }: any) {
  if (!name || !email || !password || !confirmPassword) return 'Missing fields'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email'
  if (password.length < 6) return 'Password too short'
  if (password !== confirmPassword) return 'Passwords do not match'
  return null
}

export function validateLogin({ email, password }: any) {
  if (!email || !password) return 'Missing credentials'
  return null
}

export function validateProfile(body: any) {
  if (!body.currentRole) return 'Current Role is required'
  if (!body.careerGoal) return 'Career Goal is required'
  if (!body.skillLevel) return 'Skill Level is required'
  if (!body.weeklyLearningTime) return 'Weekly Learning Time is required'
  return null
}

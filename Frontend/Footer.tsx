import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-10">
      <div className="container py-10 grid md:grid-cols-3 gap-6 items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-bold">P</div>
            <span className="text-lg font-semibold">PathWise</span>
          </div>
          <p className="mt-2 text-sm text-gray-400">AI-powered personalized learning paths for career growth.</p>
        </div>
        <nav className="flex justify-center gap-4 text-sm">
          <a href="#home" className="hover:text-white text-gray-300">Home</a>
          <a href="#about" className="hover:text-white text-gray-300">About</a>
          <a href="#features" className="hover:text-white text-gray-300">Features</a>
          <a href="#solution" className="hover:text-white text-gray-300">Solution</a>
          <a href="#contact" className="hover:text-white text-gray-300">Contact</a>
        </nav>
        <div className="text-right text-xs text-gray-500">
          <p>© {new Date().getFullYear()} PathWise</p>
        </div>
      </div>
    </footer>
  )
}


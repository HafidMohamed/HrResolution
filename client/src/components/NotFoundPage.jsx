// NotFoundPage.jsx
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Animated SVG */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <svg
            className="w-full h-auto"
            viewBox="0 0 800 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              d="M169.5 297.5C169.5 297.5 179 278.5 190.5 278.5C202 278.5 212 297.5 212 297.5"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              d="M588.5 297.5C588.5 297.5 598 278.5 609.5 278.5C621 278.5 631 297.5 631 297.5"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              d="M325 170.5C325 170.5 370.5 141.5 400 141.5C429.5 141.5 475 170.5 475 170.5"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <motion.circle
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              cx="400"
              cy="200"
              r="150"
              stroke="currentColor"
              strokeWidth="4"
              className="fill-none"
            />
            <motion.text
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              className="fill-current text-8xl font-bold"
              style={{ fontSize: '120px' }}
            >
              404
            </motion.text>
          </svg>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            The page you're looking for seems to have wandered off. Don't worry, these things happen!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            onClick={() => window.history.back()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Go Back
          </Button>
          <Button
            size="lg"
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Back to Home
          </Button>
        </motion.div>

        {/* Additional Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="pt-8 border-t border-border"
        >
          <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-muted-foreground">
            <a href="/contact" className="hover:text-primary flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Contact Support
            </a>
            <a href="/faq" className="hover:text-primary flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <path d="M12 17h.01"/>
              </svg>
              FAQ
            </a>
            <a href="/sitemap" className="hover:text-primary flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <line x1="3" x2="21" y1="9" y2="9"/>
                <line x1="3" x2="21" y1="15" y2="15"/>
                <line x1="9" x2="9" y1="9" y2="21"/>
                <line x1="15" x2="15" y1="9" y2="21"/>
              </svg>
              Sitemap
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
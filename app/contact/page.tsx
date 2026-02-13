import { Mail, MessageCircle, Github } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Contact - Minimal Next.js Site',
  description: 'Get in touch with us.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <Mail className="w-16 h-16 mx-auto mb-4 text-gray-700" />
          <h1 className="text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-xl text-gray-600">
            We&apos;d love to hear from you. Here&apos;s how you can reach us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Mail className="w-8 h-8 text-gray-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Email Us</h3>
                  <p className="text-gray-600 mb-3">
                    For general inquiries and support
                  </p>
                  <a
                    href="mailto:hello@example.com"
                    className="text-blue-600 hover:underline"
                  >
                    hello@example.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <MessageCircle className="w-8 h-8 text-gray-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Social Media</h3>
                  <p className="text-gray-600 mb-3">
                    Connect with us online
                  </p>
                  <div className="space-y-2">
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block"
                    >
                      Twitter
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <Github className="w-12 h-12 mx-auto mb-4 text-gray-700" />
              <h3 className="text-2xl font-semibold mb-3">Open Source</h3>
              <p className="text-gray-600 mb-4">
                This project is built with Next.js 14 and deployed on Vercel.
                Check out our repository to learn more about the tech stack.
              </p>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on GitHub
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>We typically respond within 24-48 hours</p>
        </div>
      </div>
    </main>
  )
}

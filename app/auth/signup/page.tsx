'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Password strength checker
function checkPasswordStrength(password: string) {
  let strength = 0
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  if (checks.length) strength++
  if (checks.uppercase) strength++
  if (checks.lowercase) strength++
  if (checks.number) strength++
  if (checks.special) strength++

  return { strength, checks }
}

function getStrengthLabel(strength: number) {
  if (strength === 0) return { label: '', color: '' }
  if (strength <= 2) return { label: 'Weak', color: 'text-red-600 bg-red-100' }
  if (strength <= 3) return { label: 'Fair', color: 'text-yellow-600 bg-yellow-100' }
  if (strength <= 4) return { label: 'Good', color: 'text-blue-600 bg-blue-100' }
  return { label: 'Strong', color: 'text-green-600 bg-green-100' }
}

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, checks: { length: false, uppercase: false, lowercase: false, number: false, special: false } })

  const supabase = createClient()

  // Check password strength on change
  useEffect(() => {
    if (password) {
      setPasswordStrength(checkPasswordStrength(password))
    } else {
      setPasswordStrength({ strength: 0, checks: { length: false, uppercase: false, lowercase: false, number: false, special: false } })
    }
  }, [password])

  // Check if email exists (debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (email && email.includes('@')) {
        setCheckingEmail(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email)
          .single()
        
        setEmailExists(!!data && !error)
        setCheckingEmail(false)
      } else {
        setEmailExists(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [email, supabase])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (emailExists) {
      setError('An account with this email already exists. Please sign in instead.')
      return
    }

    if (passwordStrength.strength < 3) {
      setError('Please choose a stronger password. Use at least 8 characters with uppercase, lowercase, and numbers.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead.')
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a confirmation email. Please check your inbox and click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login">
              <Button className="w-full">Go to Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
          <CardDescription>
            Create your account to start shopping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={emailExists ? 'border-red-500' : ''}
              />
              {checkingEmail && (
                <p className="text-xs text-gray-500 mt-1">Checking availability...</p>
              )}
              {emailExists && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ This email is already registered. <Link href="/auth/login" className="underline font-medium">Sign in instead</Link>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={8}
              />
              
              {password && (
                <>
                  <div className="mt-2">
                    <div className={`text-xs font-medium px-2 py-1 rounded inline-block ${getStrengthLabel(passwordStrength.strength).color}`}>
                      {getStrengthLabel(passwordStrength.strength).label}
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-xs">
                      <span className={passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}>
                        {passwordStrength.checks.length ? '✓' : '○'} At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}>
                        {passwordStrength.checks.uppercase ? '✓' : '○'} One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}>
                        {passwordStrength.checks.lowercase ? '✓' : '○'} One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}>
                        {passwordStrength.checks.number ? '✓' : '○'} One number
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={passwordStrength.checks.special ? 'text-green-600' : 'text-gray-400'}>
                        {passwordStrength.checks.special ? '✓' : '○'} One special character
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading || emailExists || passwordStrength.strength < 3}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignUp}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/auth/login" className="font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function checkPasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
  const strength = Object.values(checks).filter(Boolean).length
  return { strength, checks }
}

function StrengthLabel({ strength }: { strength: number }) {
  if (strength === 0) return null
  const map: Record<number, { label: string; color: string }> = {
    1: { label: 'Weak', color: 'text-red-600 bg-red-100' },
    2: { label: 'Weak', color: 'text-red-600 bg-red-100' },
    3: { label: 'Fair', color: 'text-yellow-600 bg-yellow-100' },
    4: { label: 'Good', color: 'text-blue-600 bg-blue-100' },
    5: { label: 'Strong', color: 'text-green-600 bg-green-100' },
  }
  const { label, color } = map[strength] ?? map[1]
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded inline-block ${color}`}>
      {label}
    </span>
  )
}

export default function AccountPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameMessage, setNameMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pwStrength, setPwStrength] = useState({ strength: 0, checks: { length: false, uppercase: false, lowercase: false, number: false, special: false } })

  const [loading, setLoading] = useState(true)
  const [notLoggedIn, setNotLoggedIn] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setNotLoggedIn(true); setLoading(false); return }
      setEmail(user.email ?? '')
      const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      if (data?.full_name) setFullName(data.full_name)
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setPwStrength(newPassword ? checkPasswordStrength(newPassword) : { strength: 0, checks: { length: false, uppercase: false, lowercase: false, number: false, special: false } })
  }, [newPassword])

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameMessage(null)
    setNameLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setNameMessage({ type: 'error', text: 'Not logged in.' }); setNameLoading(false); return }
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
    setNameMessage(error ? { type: 'error', text: error.message } : { type: 'success', text: 'Name updated.' })
    setNameLoading(false)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMessage(null)

    if (pwStrength.strength < 3) {
      setPwMessage({ type: 'error', text: 'Please choose a stronger password.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setPwLoading(true)

    // Re-authenticate with current password first
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
    if (signInError) {
      setPwMessage({ type: 'error', text: 'Current password is incorrect.' })
      setPwLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPwMessage({ type: 'error', text: error.message })
    } else {
      setPwMessage({ type: 'success', text: 'Password updated successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setPwLoading(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
  }

  if (notLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign in to view your account</CardTitle>
          </CardHeader>
          <CardContent>
            <a href="/auth/login">
              <Button className="w-full">Sign In</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Account Settings</h1>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input value={email} disabled className="bg-gray-100 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              {nameMessage && (
                <p className={`text-sm ${nameMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {nameMessage.text}
                </p>
              )}
              <Button type="submit" disabled={nameLoading}>
                {nameLoading ? 'Saving...' : 'Save Name'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <StrengthLabel strength={pwStrength.strength} />
                    <div className="mt-1 space-y-1">
                      {[
                        ['length', 'At least 8 characters'],
                        ['uppercase', 'One uppercase letter'],
                        ['lowercase', 'One lowercase letter'],
                        ['number', 'One number'],
                        ['special', 'One special character'],
                      ].map(([key, label]) => (
                        <p key={key} className={`text-xs ${pwStrength.checks[key as keyof typeof pwStrength.checks] ? 'text-green-600' : 'text-gray-400'}`}>
                          {pwStrength.checks[key as keyof typeof pwStrength.checks] ? '✓' : '○'} {label}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                {confirmPassword && (
                  <p className={`text-xs mt-1 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                    {newPassword === confirmPassword ? '✓ Passwords match' : '⚠ Passwords do not match'}
                  </p>
                )}
              </div>
              {pwMessage && (
                <p className={`text-sm ${pwMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {pwMessage.text}
                </p>
              )}
              <Button
                type="submit"
                disabled={pwLoading || pwStrength.strength < 3 || newPassword !== confirmPassword || !currentPassword}
              >
                {pwLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

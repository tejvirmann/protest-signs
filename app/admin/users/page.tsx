'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface Profile {
  id: string
  email: string
  is_admin: boolean
  is_owner: boolean
  created_at: string
}

interface CurrentUser {
  id: string
  is_admin: boolean
  is_owner: boolean
}

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function loadUsers() {
    const res = await fetch('/api/admin/users')
    if (!res.ok) {
      setError('Failed to load users')
      setLoading(false)
      return
    }
    const data = await res.json()
    setProfiles(data.profiles)
    setCurrentUser(data.currentUser)
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  async function doAction(targetId: string, action: string, confirmMessage: string) {
    if (!confirm(confirmMessage)) return
    setActionLoading(targetId + action)
    setError('')
    const res = await fetch(`/api/admin/users/${targetId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
    } else {
      await loadUsers()
    }
    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-gray-500">Loading users...</p>
      </div>
    )
  }

  const isOwner = currentUser?.is_owner

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-1">User Management</h2>
        <p className="text-gray-500 text-sm">
          {isOwner
            ? 'As owner, you can promote/demote admins and transfer ownership.'
            : 'Admins can view users. Only the owner can change roles.'}
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              {isOwner && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {profiles.map((profile) => {
              const isSelf = profile.id === currentUser?.id
              const isLoading = actionLoading?.startsWith(profile.id)

              return (
                <tr key={profile.id} className={isSelf ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {profile.email}
                      {isSelf && (
                        <span className="ml-2 text-xs text-blue-600 font-normal">(you)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">{profile.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {profile.is_owner && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Owner
                        </span>
                      )}
                      {profile.is_admin && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Admin
                        </span>
                      )}
                      {!profile.is_admin && !profile.is_owner && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Customer
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                  {isOwner && (
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      {!isSelf && !profile.is_owner && (
                        <>
                          {profile.is_admin ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!!isLoading}
                              onClick={() =>
                                doAction(
                                  profile.id,
                                  'remove_admin',
                                  `Remove admin access from ${profile.email}?`
                                )
                              }
                            >
                              {isLoading ? '...' : 'Remove Admin'}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!!isLoading}
                              onClick={() =>
                                doAction(
                                  profile.id,
                                  'make_admin',
                                  `Make ${profile.email} an admin?`
                                )
                              }
                            >
                              {isLoading ? '...' : 'Make Admin'}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!!isLoading}
                            className="text-purple-700 border-purple-300 hover:bg-purple-50"
                            onClick={() =>
                              doAction(
                                profile.id,
                                'transfer_owner',
                                `TRANSFER OWNERSHIP to ${profile.email}?\n\nYou will lose owner status. This cannot be undone from the UI — only via the database.\n\nAre you absolutely sure?`
                              )
                            }
                          >
                            {isLoading ? '...' : 'Transfer Ownership'}
                          </Button>
                        </>
                      )}
                      {isSelf && (
                        <span className="text-xs text-gray-400 italic">Cannot modify yourself</span>
                      )}
                      {!isSelf && profile.is_owner && (
                        <span className="text-xs text-gray-400 italic">Owner — protected</span>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium mb-1">Role rules:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Owner can promote/demote admins and transfer ownership</li>
          <li>Admins can manage signs, tags, and orders — but not users</li>
          <li>Only one owner at a time — transferring removes your own owner status</li>
          <li>To revert an accidental ownership transfer, run SQL directly in Supabase</li>
        </ul>
      </div>
    </div>
  )
}

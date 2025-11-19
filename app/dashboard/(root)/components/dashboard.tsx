'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui'
import { useAuth } from '@/app/features/auth/hooks/use-auth'
import { formatDate } from '@/common/utils/helpers'

/**
 * Dashboard component displaying user information and overview
 */
export function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{user?.email ? `, ${user.email}` : ''}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>
              Your account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
              <p><strong>ID:</strong> {user?.id || 'Not available'}</p>
              {user?.created_at && (
                <p><strong>Member since:</strong> {formatDate(user.created_at)}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>
              Your activity overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Status:</strong> Active</p>
              <p><strong>Last login:</strong> Today</p>
              <p><strong>Account type:</strong> Free</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Quick actions to get you started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>• Complete your profile</p>
              <p>• Explore features</p>
              <p>• Check out settings</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

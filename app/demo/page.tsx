"use client"

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Code2, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function DemoPage() {
  const { data: session, status } = useSession()
  const [apiTest, setApiTest] = useState<{ loading: boolean; success: boolean; data?: any; error?: string }>({
    loading: false,
    success: false
  })

  const testAuthAPI = async () => {
    setApiTest({ loading: true, success: false })
    
    try {
      const response = await fetch('/api/test-auth')
      const data = await response.json()
      
      if (response.ok) {
        setApiTest({ loading: false, success: true, data })
      } else {
        setApiTest({ loading: false, success: false, error: data.error })
      }
    } catch (error) {
      setApiTest({ loading: false, success: false, error: 'Network error' })
    }
  }

  useEffect(() => {
    if (session) {
      testAuthAPI()
    }
  }, [session])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Code2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Hirely Auth Demo</span>
          </div>
          <Link href="/">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Session Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {status === 'loading' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : session ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Session Status
              </CardTitle>
              <CardDescription>
                Current authentication state
              </CardDescription>
            </CardHeader>
            <CardContent>
              {status === 'loading' && (
                <p className="text-muted-foreground">Loading session...</p>
              )}
              
              {status === 'unauthenticated' && (
                <div className="space-y-4">
                  <p className="text-red-600">Not authenticated</p>
                  <div className="flex gap-2">
                    <Link href="/auth/signin">
                      <Button size="sm">Sign In</Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="sm" variant="outline">Sign Up</Button>
                    </Link>
                  </div>
                </div>
              )}
              
              {session && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">Authenticated</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {session.user?.name || 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {session.user?.email}
                    </div>
                    <div>
                      <span className="font-medium">User ID:</span> {session.user?.id}
                    </div>
                    {session.user?.image && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Avatar:</span>
                        <img 
                          src={session.user.image} 
                          alt="Avatar" 
                          className="h-8 w-8 rounded-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {apiTest.loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : apiTest.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : apiTest.error ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-muted" />
                )}
                Protected API Test
              </CardTitle>
              <CardDescription>
                Test server-side authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={testAuthAPI} 
                  disabled={apiTest.loading || !session}
                  size="sm"
                >
                  {apiTest.loading ? 'Testing...' : 'Test API'}
                </Button>
                
                {apiTest.success && apiTest.data && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">API Working!</span>
                    </div>
                    <div className="bg-muted p-3 rounded text-xs font-mono">
                      <pre>{JSON.stringify(apiTest.data, null, 2)}</pre>
                    </div>
                  </div>
                )}
                
                {apiTest.error && (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">{apiTest.error}</span>
                  </div>
                )}
                
                {!session && (
                  <p className="text-muted-foreground text-sm">
                    Sign in to test the protected API
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Authentication Features</CardTitle>
            <CardDescription>
              Complete authentication system implemented
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FeatureItem 
                title="OAuth Login"
                description="Google & GitHub authentication"
                implemented={true}
              />
              <FeatureItem 
                title="Email/Password"
                description="Traditional signup with verification"
                implemented={true}
              />
              <FeatureItem 
                title="OTP Verification"
                description="Email-based verification codes"
                implemented={true}
              />
              <FeatureItem 
                title="Welcome Emails"
                description="Branded welcome messages"
                implemented={true}
              />
              <FeatureItem 
                title="Protected Routes"
                description="Middleware-based route protection"
                implemented={true}
              />
              <FeatureItem 
                title="Session Management"
                description="Secure JWT-based sessions"
                implemented={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FeatureItem({ title, description, implemented }: { 
  title: string
  description: string
  implemented: boolean 
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border">
      {implemented ? (
        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
      )}
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
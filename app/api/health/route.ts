import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const healthCheck: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
      stripeKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'configured' : 'missing',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
    },
    supabase: {
      status: 'unknown',
      error: null,
    },
  }

  // Test Supabase connection
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      const { error } = await supabase.from('tags').select('count').limit(1)

      if (error) {
        healthCheck.supabase.status = 'error'
        healthCheck.supabase.error = error.message
        healthCheck.status = 'degraded'
      } else {
        healthCheck.supabase.status = 'connected'
      }
    } else {
      healthCheck.supabase.status = 'not_configured'
      healthCheck.status = 'degraded'
    }
  } catch (error: any) {
    healthCheck.supabase.status = 'error'
    healthCheck.supabase.error = error.message
    healthCheck.status = 'degraded'
  }

  return NextResponse.json(healthCheck)
}

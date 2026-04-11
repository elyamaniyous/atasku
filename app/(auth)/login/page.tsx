'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod/v4'
import { Eye, EyeOff, Loader2, Mail } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  email: z.email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Magic link state
  const [magicLinkMode, setMagicLinkMode] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [magicLinkLoading, setMagicLinkLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const errs: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]
        if (typeof key === 'string') errs[key] = issue.message
      }
      setFieldErrors(errs)
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect'
          : authError.message
      )
      setLoading(false)
      return
    }

    router.push('/')
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email || !z.email().safeParse(email).success) {
      setFieldErrors({ email: 'Adresse email invalide' })
      return
    }
    setFieldErrors({})

    setMagicLinkLoading(true)
    const { error: otpError } = await supabase.auth.signInWithOtp({ email })

    if (otpError) {
      setError(otpError.message)
      setMagicLinkLoading(false)
      return
    }

    setMagicLinkSent(true)
    setMagicLinkLoading(false)
  }

  if (magicLinkSent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="font-heading text-2xl text-stone-800">
          Vérifiez votre boîte email
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          Un lien de connexion a été envoyé à{' '}
          <span className="font-medium text-stone-700">{email}</span>
        </p>
        <Button
          variant="outline"
          size="lg"
          className="mt-6 w-full"
          onClick={() => {
            setMagicLinkSent(false)
            setMagicLinkMode(false)
          }}
        >
          Retour à la connexion
        </Button>
      </div>
    )
  }

  if (magicLinkMode) {
    return (
      <div>
        <h2 className="font-heading text-2xl text-stone-800">
          Lien magique
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Recevez un lien de connexion par email
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleMagicLink} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="magic-email">Email</Label>
            <Input
              id="magic-email"
              type="email"
              placeholder="vous@entreprise.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
              aria-invalid={!!fieldErrors.email}
              required
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-red-600 text-white hover:bg-red-700"
            disabled={magicLinkLoading}
          >
            {magicLinkLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Envoyer le lien'
            )}
          </Button>
        </form>

        <button
          type="button"
          className="mt-4 w-full text-center text-sm text-stone-500 hover:text-stone-700"
          onClick={() => {
            setMagicLinkMode(false)
            setError(null)
            setFieldErrors({})
          }}
        >
          Retour à la connexion classique
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-heading text-2xl text-stone-800">Connectez-vous</h2>
      <p className="mt-1 text-sm text-stone-500">
        Accédez à votre espace de maintenance
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@entreprise.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10"
            aria-invalid={!!fieldErrors.email}
            required
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 pr-10"
              aria-invalid={!!fieldErrors.password}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-red-600 text-white hover:bg-red-700"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Se connecter'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-stone-400">ou</span>
        </div>
      </div>

      {/* Magic link */}
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => {
          setMagicLinkMode(true)
          setError(null)
          setFieldErrors({})
        }}
      >
        <Mail className="mr-2 h-4 w-4" />
        Recevoir un lien magique
      </Button>

      {/* Sign up link */}
      <p className="mt-6 text-center text-sm text-stone-500">
        Pas encore de compte ?{' '}
        <Link href="/signup" className="font-medium text-red-600 hover:text-red-700">
          Créer un compte
        </Link>
      </p>
    </div>
  )
}

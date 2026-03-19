import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  saveGeminiToken,
  saveGitHubToken,
  validateGeminiToken,
} from '@/services/api'
import {
  Loader2,
  Key,
  ExternalLink,
  Github,
  AlertCircle,
} from 'lucide-react'

interface SetupScreenProps {
  onComplete: () => void
}

export function SetupScreen({ onComplete }: SetupScreenProps) {
  const { toast } = useToast()

  const [geminiKey, setGeminiKey] = useState('')
  const [githubPat, setGithubPat] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleComplete = async () => {
    if (!geminiKey.trim() || !githubPat.trim()) {
      toast({
        title: 'Missing tokens',
        description: 'Please enter both API keys to continue',
        variant: 'destructive',
      })
      return
    }

    setValidationError(null)
    setIsValidating(true)

    try {
      const validationResult = await validateGeminiToken(geminiKey.trim())
      if (!validationResult.valid) {
        setValidationError(validationResult.error || 'Invalid Gemini API key')
        toast({
          title: 'Invalid Gemini API Key',
          description:
            validationResult.error ||
            'The API key you entered is not valid. Please check and try again.',
          variant: 'destructive',
        })
        setIsValidating(false)
        return
      }

      setIsValidating(false)
      setIsSaving(true)

      await Promise.all([
        saveGeminiToken(geminiKey.trim()),
        saveGitHubToken(githubPat.trim()),
      ])

      toast({
        title: 'Setup Complete!',
        description: 'Your API keys have been saved successfully',
      })

      onComplete()
    } catch (err: any) {
      console.error('Failed to save tokens:', err)
      const message =
        err?.response?.data?.error || err?.message || 'Failed to save API keys'
      setValidationError(message)
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsValidating(false)
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-background bg-mesh-gradient flex items-center justify-center p-4">
      <div className="glass border border-border/50 rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg w-full animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Key className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Complete Your Setup
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter your API keys to start generating work reports
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-900 dark:bg-gray-800 rounded-lg">
                <Github className="h-4 w-4 text-white" />
              </div>
              <Label htmlFor="github-pat" className="text-base font-medium">
                GitHub Personal Access Token
              </Label>
            </div>
            <Input
              id="github-pat"
              type="password"
              placeholder="ghp_xxxx..."
              value={githubPat}
              onChange={(e) => setGithubPat(e.target.value)}
              className="bg-background/50"
              disabled={isSaving || isValidating}
            />
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg">
              <ExternalLink className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>
                Generate a token with{' '}
                <code className="px-1 py-0.5 bg-muted rounded text-xs">repo</code>{' '}
                scope from{' '}
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub Settings
                </a>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Key className="h-4 w-4 text-white" />
              </div>
              <Label htmlFor="gemini-key" className="text-base font-medium">
                Gemini API Key
              </Label>
            </div>
            <Input
              id="gemini-key"
              type="password"
              placeholder="AIza..."
              value={geminiKey}
              onChange={(e) => {
                setGeminiKey(e.target.value)
                setValidationError(null)
              }}
              className={`bg-background/50 ${validationError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              disabled={isSaving || isValidating}
            />
            {validationError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationError}
              </p>
            )}
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg">
              <ExternalLink className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>
                Get your API key from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleComplete}
          disabled={
            isSaving || isValidating || !geminiKey.trim() || !githubPat.trim()
          }
          className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-5"
          size="lg"
        >
          {isValidating ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Validating...
            </span>
          ) : isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            'Complete Setup'
          )}
        </Button>

        <p className="text-xs text-muted-foreground/60 text-center mt-4">
          Your API keys are stored securely and encrypted
        </p>
      </div>
    </div>
  )
}

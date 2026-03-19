import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  getGeminiToken,
  saveGeminiToken,
  deleteGeminiToken,
  validateGeminiToken,
  getGitHubToken,
  saveGitHubToken,
  deleteGitHubToken,
} from '@/services/api'
import {
  Loader2,
  Key,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Github,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

export function SettingsModal({ open, onOpenChange, onSaved }: SettingsModalProps) {
  const { toast } = useToast()
  
  // GitHub PAT state
  const [githubPat, setGithubPat] = useState('')
  const [isLoadingGithub, setIsLoadingGithub] = useState(false)
  const [isSavingGithub, setIsSavingGithub] = useState(false)
  const [hasGithubPat, setHasGithubPat] = useState(false)
  
  // Gemini API key state
  const [geminiKey, setGeminiKey] = useState('')
  const [isLoadingGemini, setIsLoadingGemini] = useState(false)
  const [isValidatingGemini, setIsValidatingGemini] = useState(false)
  const [isSavingGemini, setIsSavingGemini] = useState(false)
  const [hasGeminiKey, setHasGeminiKey] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      loadTokens()
    }
  }, [open])

  const loadTokens = async () => {
    // Load GitHub PAT
    setIsLoadingGithub(true)
    try {
      const githubData = await getGitHubToken()
      if (githubData.hasToken && githubData.pat) {
        setGithubPat(githubData.pat)
        setHasGithubPat(true)
      } else {
        setGithubPat('')
        setHasGithubPat(false)
      }
    } catch (err) {
      console.error('Failed to load GitHub PAT:', err)
    } finally {
      setIsLoadingGithub(false)
    }

    // Load Gemini API key
    setIsLoadingGemini(true)
    setValidationError(null)
    try {
      const geminiData = await getGeminiToken()
      if (geminiData.hasToken && geminiData.apiKey) {
        setGeminiKey(geminiData.apiKey)
        setHasGeminiKey(true)
      } else {
        setGeminiKey('')
        setHasGeminiKey(false)
      }
    } catch (err) {
      console.error('Failed to load Gemini key:', err)
    } finally {
      setIsLoadingGemini(false)
    }
  }

  const handleSaveGithub = async () => {
    if (!githubPat.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid GitHub PAT',
        variant: 'destructive',
      })
      return
    }

    setIsSavingGithub(true)
    try {
      await saveGitHubToken(githubPat.trim())
      setHasGithubPat(true)
      toast({
        title: 'Success',
        description: 'GitHub PAT saved successfully',
      })
      onSaved?.()
    } catch (err: any) {
      console.error('Failed to save GitHub PAT:', err)
      toast({
        title: 'Error',
        description: err?.response?.data?.error || 'Failed to save GitHub PAT',
        variant: 'destructive',
      })
    } finally {
      setIsSavingGithub(false)
    }
  }

  const handleDeleteGithub = async () => {
    setIsSavingGithub(true)
    try {
      await deleteGitHubToken()
      setGithubPat('')
      setHasGithubPat(false)
      toast({
        title: 'Success',
        description: 'GitHub PAT removed successfully',
      })
    } catch (err) {
      console.error('Failed to delete GitHub PAT:', err)
      toast({
        title: 'Error',
        description: 'Failed to remove GitHub PAT',
        variant: 'destructive',
      })
    } finally {
      setIsSavingGithub(false)
    }
  }

  const handleSaveGemini = async () => {
    if (!geminiKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid API key',
        variant: 'destructive',
      })
      return
    }

    setValidationError(null)
    setIsValidatingGemini(true)

    try {
      const validationResult = await validateGeminiToken(geminiKey.trim())
      if (!validationResult.valid) {
        setValidationError(validationResult.error || 'Invalid API key')
        toast({
          title: 'Invalid API Key',
          description: validationResult.error || 'The API key you entered is not valid.',
          variant: 'destructive',
        })
        setIsValidatingGemini(false)
        return
      }
      
      setIsValidatingGemini(false)
      setIsSavingGemini(true)

      await saveGeminiToken(geminiKey.trim())
      setHasGeminiKey(true)
      toast({
        title: 'Success',
        description: 'Gemini API key saved successfully',
      })
      onSaved?.()
    } catch (err: any) {
      console.error('Failed to save Gemini key:', err)
      const message = err?.response?.data?.error || err?.message || 'Failed to save Gemini API key'
      setValidationError(message)
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsValidatingGemini(false)
      setIsSavingGemini(false)
    }
  }

  const handleDeleteGemini = async () => {
    setIsSavingGemini(true)
    try {
      await deleteGeminiToken()
      setGeminiKey('')
      setHasGeminiKey(false)
      toast({
        title: 'Success',
        description: 'Gemini API key removed successfully',
      })
    } catch (err) {
      console.error('Failed to delete Gemini key:', err)
      toast({
        title: 'Error',
        description: 'Failed to remove Gemini API key',
        variant: 'destructive',
      })
    } finally {
      setIsSavingGemini(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Key className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your API keys and tokens. All credentials are stored securely in the database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* GitHub PAT Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-900 dark:bg-gray-800 rounded-lg">
                <Github className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">GitHub Personal Access Token</h3>
                <p className="text-sm text-muted-foreground">
                  Required to fetch your repositories and commits
                </p>
              </div>
            </div>

            {isLoadingGithub ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="github-pat">Personal Access Token</Label>
                  <Input
                    id="github-pat"
                    type="password"
                    placeholder="ghp_xxxx..."
                    value={githubPat}
                    onChange={(e) => setGithubPat(e.target.value)}
                    className="bg-background/50"
                    disabled={isSavingGithub}
                  />
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Generate a token with <code className="px-1 py-0.5 bg-muted rounded text-xs">repo</code> scope from{' '}
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
                {hasGithubPat && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    GitHub PAT saved
                  </div>
                )}
                <div className="flex gap-2">
                  {hasGithubPat && (
                    <Button
                      variant="outline"
                      onClick={handleDeleteGithub}
                      disabled={isSavingGithub}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {isSavingGithub ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Remove
                    </Button>
                  )}
                  <Button
                    onClick={handleSaveGithub}
                    disabled={isSavingGithub || !githubPat.trim()}
                    className="ml-auto bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {isSavingGithub ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Token'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Gemini API Key Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Key className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">Gemini API Key</h3>
                <p className="text-sm text-muted-foreground">
                  Required for AI-powered work report generation
                </p>
              </div>
            </div>

            {isLoadingGemini ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="gemini-key">API Key</Label>
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
                    disabled={isValidatingGemini || isSavingGemini}
                  />
                  {validationError && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validationError}
                    </p>
                  )}
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
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
                {hasGeminiKey && !validationError && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    Gemini API key saved and validated
                  </div>
                )}
                <div className="flex gap-2">
                  {hasGeminiKey && (
                    <Button
                      variant="outline"
                      onClick={handleDeleteGemini}
                      disabled={isSavingGemini || isValidatingGemini}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {isSavingGemini ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Remove
                    </Button>
                  )}
                  <Button
                    onClick={handleSaveGemini}
                    disabled={isSavingGemini || isValidatingGemini || !geminiKey.trim()}
                    className="ml-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    {isValidatingGemini ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Validating...
                      </>
                    ) : isSavingGemini ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Key'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

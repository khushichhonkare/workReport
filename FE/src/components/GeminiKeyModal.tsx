import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
} from '@/services/api'
import {
  Loader2,
  Key,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

interface GeminiKeyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  required?: boolean
  onSaved?: () => void
}

export function GeminiKeyModal({
  open,
  onOpenChange,
  required = false,
  onSaved,
}: GeminiKeyModalProps) {
  const { toast } = useToast()
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasExistingKey, setHasExistingKey] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setIsLoading(true)
      setValidationError(null)
      getGeminiToken()
        .then((data) => {
          if (data.hasToken && data.apiKey) {
            setApiKey(data.apiKey)
            setHasExistingKey(true)
          } else {
            setApiKey('')
            setHasExistingKey(false)
          }
        })
        .catch((err) => {
          console.error('Failed to load Gemini key:', err)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [open])

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid API key',
        variant: 'destructive',
      })
      return
    }

    setValidationError(null)
    setIsValidating(true)

    try {
      const validationResult = await validateGeminiToken(apiKey.trim())
      if (!validationResult.valid) {
        setValidationError(validationResult.error || 'Invalid API key')
        toast({
          title: 'Invalid API Key',
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

      await saveGeminiToken(apiKey.trim())
      setHasExistingKey(true)
      toast({
        title: 'Success',
        description: 'Gemini API key saved successfully',
      })
      onSaved?.()
      if (!required) {
        onOpenChange(false)
      }
    } catch (err: any) {
      console.error('Failed to save Gemini key:', err)
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to save Gemini API key'
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

  const handleDelete = async () => {
    if (required) return

    setIsSaving(true)
    try {
      await deleteGeminiToken()
      setApiKey('')
      setHasExistingKey(false)
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
      setIsSaving(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (required && !hasExistingKey) {
      return
    }
    onOpenChange(newOpen)
  }

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    setValidationError(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) =>
          required && !hasExistingKey && e.preventDefault()
        }
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Gemini API Key
          </DialogTitle>
          <DialogDescription>
            {required && !hasExistingKey ? (
              <span className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                Please enter your Gemini API key to continue using the app.
              </span>
            ) : (
              'Enter your Gemini API key to generate AI-powered work reports. Your key is stored securely in the database.'
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="gemini-key">API Key</Label>
                <Input
                  id="gemini-key"
                  type="password"
                  placeholder="AIza..."
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  className={`bg-background/50 ${validationError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  disabled={isValidating || isSaving}
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
              {hasExistingKey && !required && !validationError && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  API key saved and validated
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!required && hasExistingKey && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isSaving || isLoading || isValidating}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Remove
            </Button>
          )}
          <div className="flex gap-2 flex-1 justify-end">
            {!required && (
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving || isLoading || isValidating}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading || isValidating || !apiKey.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white min-w-[100px]"
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
                'Save'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

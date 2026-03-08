import { GoogleGenerativeAI } from '@google/generative-ai'

export async function validateGeminiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return { valid: false, error: 'API key is required' }
  }
  const genAI = new GoogleGenerativeAI(apiKey)
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    await model.generateContent('test')
    return { valid: true }
  } catch (error) {
    console.error('Gemini Key Validation Error:', error.message)
    if (
      error.message?.includes('API_KEY_INVALID') ||
      error.message?.includes('invalid')
    ) {
      return { valid: false, error: 'Invalid API key' }
    }
    if (error.message?.includes('quota') || error.message?.includes('QUOTA')) {
      return { valid: true }
    }
    return {
      valid: false,
      error: error.message || 'Failed to validate API key',
    }
  }
}

export default async function generateReportWithGemini(prompt, apiKey) {
  const keyToUse = apiKey || process.env.GEMINI_API_KEY

  if (!keyToUse) {
    throw new Error('Gemini API key is required')
  }

  const genAI = new GoogleGenerativeAI(keyToUse)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    })

    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API Error:', error)
    throw error
  }
}

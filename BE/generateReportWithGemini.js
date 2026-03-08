import { GoogleGenerativeAI } from '@google/generative-ai'

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

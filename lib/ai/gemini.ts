import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-3.1-flash-lite-preview',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 4096,
  },
})

export const geminiModelJSON = genAI.getGenerativeModel({
  model: 'gemini-3.1-flash-lite-preview',
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 4096,
    responseMimeType: 'application/json',
  },
})

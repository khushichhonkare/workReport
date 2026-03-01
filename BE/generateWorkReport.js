import generateReportWithGemini from './generateReportWithGemini.js'

export default async function generateWorkReport(arr) {
  const instruction = `You are an AI assistant that generates structured work reports from git commit messages.

Your task:
Convert the provided array of commit messages into a structured work report JSON.

Rules:
1. Classify commits as follows:
   - "feat", "refactor", "chore", "setup", or similar → completed
   - "fix" → fixes
2. Do not assume anything beyond the commit messages.
3. If there are no fixes, return an empty array for "fixes".
4. If there are no pending tasks mentioned, return an empty array for "pending".
5. Rephrase commit messages into clear, professional, human-readable work report statements.
6. Do NOT use markdown, bold text, explanations, headings, or extra commentary.
7. Output ONLY valid raw JSON.
8. The response must be directly parsable using JSON.parse().
9. Do not wrap output in backticks or template strings.

Required JSON format:

{
  "completed": [],
  "fixes": [],
  "pending": []
}

Commit messages:`
  const huggingFaceRes = await generateReportWithGemini(`${instruction}${arr}`)

  return `${huggingFaceRes}`
}

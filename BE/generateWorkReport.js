import generateReportWithGemini from './generateReportWithGemini.js'

export default async function generateWorkReport(
  commits,
  meetingsSummaries = [],
  geminiApiKey = null,
) {
  let meetingSection = ''
  if (meetingsSummaries && meetingsSummaries.length > 0) {
    meetingSection = `

Meetings attended:
${meetingsSummaries.map((m) => `- ${m}`).join('\n')}`
  }

  const instruction = `You are an AI assistant that generates structured work reports from git commit messages and meeting information.

Your task:
Convert the provided array of commit messages and meeting summaries into a structured work report JSON.

Rules:
1. Classify commits as follows:
   - "feat", "refactor", "chore", "setup", or similar → completed
   - "fix" → fixes
2. Include meetings in the "completed" section as "Attended meeting: [meeting summary]"
3. Do not assume anything beyond the commit messages and meetings provided.
4. If there are no fixes, return an empty array for "fixes".
5. If there are no pending tasks mentioned, return an empty array for "pending".
6. Rephrase commit messages into clear, professional, human-readable work report statements.
7. Do NOT use markdown, bold text, explanations, headings, or extra commentary.
8. Output ONLY valid raw JSON.
9. The response must be directly parsable using JSON.parse().
10. Do not wrap output in backticks or template strings.

Required JSON format:

{
  "completed": [],
  "fixes": [],
  "pending": []
}

Commit messages:
${JSON.stringify(commits)}
${meetingSection}`

  const huggingFaceRes = await generateReportWithGemini(`${instruction}`, geminiApiKey)

  return `${huggingFaceRes}`
}

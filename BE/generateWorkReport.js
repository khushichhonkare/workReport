import generateReportWithGemini from "./generateReportWithGPT.js"

export default async function generateWorkReport(arr) {
    const instruction = "Create my work report from these points without bolding anything. The report should be structured as follows: completed tasks should list all completed items, fixes should include any fixes made, and pending should list any remaining tasks if applicable. Do not add anything else, such as extra headings or text. The output should be in a structured JSON format containing completed tasks, fixes, and pending tasks, without using template strings or special formatting, ensuring it can be directly converted into valid JSON";
    const huggingFaceRes = await generateReportWithGemini(`${instruction}${arr}`)
  
    return `${huggingFaceRes}`;
  }


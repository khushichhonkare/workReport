import generateReportWithGemini from "./generateReportWithGPT.js"

export default async function generateWorkReport(arr) {
    // const typeMappings = {
    //     "fix": "I have fixed",
    //     "merge": "I have merged",
    //     "refactor": "I have refactored",
    //     "feat": "I have added"
    // };

    // const formattedSentences = arr.map(sentence => {
    // const [type, description] = sentence.split(':').map(part => part.trim());
    //     const action = typeMappings[type] || "Performed";
    //     return `${action} ${description}`;
    // });

    const reportHeader = "create my work report out of these points : Today's Work Report\n";
    // const formattedReport = formattedSentences.join('\n');
    const huggingFaceRes = await generateReportWithGemini(`${reportHeader}${arr}`)
    console.log("huggingFaceRes----->>", huggingFaceRes)
    return `${huggingFaceRes}`;
  }


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

    const reportHeader = "create my work report out of these points also do not bold anything and only give report in this format: Completed tasks: //here will be complited tasks then fixes: here will be fixes, pending: if any pending task then add this also, don;t add anything else any heading or anything, just return an structured json having complited tasks, fixes and so on also dont add any `` template strings, just give me a formate which can be tranfromed into a valid json";
    // const formattedReport = formattedSentences.join('\n');
    const huggingFaceRes = await generateReportWithGemini(`${reportHeader}${arr}`)
  
    return `${huggingFaceRes}`;
  }


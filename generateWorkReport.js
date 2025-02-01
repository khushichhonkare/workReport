export default function generateWorkReport(arr) {
    const typeMappings = {
        "fix": "I have fixed",
        "merge": "I have merged",
        "refactor": "I have refactored",
        "feat": "I have added"
    };

    const formattedSentences = arr.map(sentence => {
        const [type, description] = sentence.split(':').map(part => part.trim());
        const action = typeMappings[type] || "Performed";
        return `${action} ${description}`;
    });

    const reportHeader = "Today's Work Report\n";
    const formattedReport = formattedSentences.join('\n');
    
    return `${reportHeader}${formattedReport}`;
}


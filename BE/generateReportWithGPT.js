// // import axios from "axios";

// // // Function to correct grammar using LanguageTool API
// // export default async function generateReportWithGPT(text) {
// //     const url = "https://api.languagetool.org/v2/check";
// //     const params = {
// //       text: text,
// //       language: "en-US", 
// //     };
  
// //     try {
// //       const response = await axios.post(url, null, { params });
// //       const matches = response.data.matches;
  
// //       let correctedText = text;
// //       matches.reverse().forEach((match) => {
// //         const errorText = match.context.text.substr(
// //           match.context.offset,
// //           match.context.length
// //         );
// //         const suggestion = match.replacements[0].value;
// //         correctedText =
// //           correctedText.substr(0, match.context.offset) +
// //           suggestion +
// //           correctedText.substr(match.context.offset + match.context.length);
// //       });
  
// //       return correctedText;
// //     } catch (error) {
// //       console.error("Error correcting grammar:", error);
// //       return text; // Return original text if there's an error
// //     }
// //   }


// // import axios from 'axios';

// // export default async function generateReportWithGPT(inputText) {
// //   try {
// //     const response = await axios.post(
// //       'https://api-inference.huggingface.co/models/gpt2',
// //       { inputs: inputText },
// //       {
// //         headers: {
// //           'Authorization': `Bearer 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`,  // Replace with correct API key
// //           'Content-Type': 'application/json',
// //         },
// //       }
// //     );
// //     console.log('Generated Text:', response.data[0]?.generated_text || 'No text generated');
// //   } catch (error) {
// //     if (error.response) {
// //       console.error('Error response:', error.response.data);
// //       console.error('Error status:', error.response.status);
// //     } else {
// //       console.error('Error:', error.message);
// //     }
// //   }
// // }

// // // Example text to generate report
// // const text = "Today's work: I added a new blog model and fixed bugs in the cat model.";
// // generateReportWithGPT(text);

// import axios from 'axios';

// const apiKey = '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'; // Replace with your actual token
// // const apiUrl = 'https://api-inference.huggingface.co/models/Qwen/Qwen-4B';
// // const apiUrl = 'https://api-inference.huggingface.co/models/Qwen/Qwen1.5-4B-Chat';
// const apiUrl = 'https://api-inference.huggingface.co/models/google/gemma-2b-it';


// export default async function generateReportWithGPT(inputText) {
//     for (let i = 0; i < 3; i++) {
//       try {
//         const response = await axios.post(
//           apiUrl,
//           { inputs: inputText },
//           {
//             headers: {
//               Authorization: `Bearer ${apiKey}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//     if (response.data && response.data[0]?.generated_text) {
//       console.log('Generated Text:', response.data[0].generated_text);
//       return response.data[0].generated_text;
//     } else {
//       console.error('No text generated');
//       return inputText; // Return original text if no generated text is found
//     }
//   } catch (error) {
//     if (error.response) {
//       console.error('Error response:', error.response.data);
//       console.error('Error status:', error.response.status);
//     } else {
//       console.error('Error:', error.message);
//     }
//     return inputText; // Return original text if there's an error
//   }
// }
// }
// // Example usage
// // const text = "Today's work: I added a new blog model and fixed bugs in the cat model.";
// // generateReportWithGPT(text);


import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your actual API key
const apiKey = "AIzaSyDCpkNFdIqQal6kEPqwNtUpa6SoMBF11oU"; 
const genAI = new GoogleGenerativeAI(apiKey);

export default async function generateReportWithGemini(inputText) {
  try {
    // Choose the model (Gemini 1.5 Pro is a powerful option)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Send the request to Gemini AI
    const response = await model.generateContent(inputText);

    // Extract generated text
    const generatedText = response.response.candidates[0].content.parts[0].text;

    console.log("Generated Text:", generatedText);
    return generatedText;
  } catch (error) {
    console.error("Error:", error);
    return inputText; // Return original text if there's an error
  }
}

// Example usage
const text = "Summarize today's work: I added a new blog model and fixed bugs in the cat model.";
generateReportWithGemini(text);

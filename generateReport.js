// import OpenAI from "openai";

// // Initialize OpenAI client
// const openai = new OpenAI({
//   apiKey: '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',
// });

// export default async function generateReport(messages) {
//   const prompt = `Create a work report from the following messages:\n\n${messages.join('\n')}`;

//   try {
//     const response = await openai.chat.completions.create({
//       model: 'gpt-3.5-turbo',  // Use the appropriate model
//       messages: [
//         { role: 'system', content: 'You are a helpful assistant.' },
//         { role: 'user', content: prompt }
//       ],
//     });

//     return response.choices[0].message.content;
//   } catch (error) {
//     console.error('Error generating report:', error);
//     throw new Error('Failed to generate report');
//   }
// }

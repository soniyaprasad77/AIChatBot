"use strict";
require('dotenv').config();
const readline = require('readline');
const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function queryLLM(prompt) {
    const detailedPrompt = `
        You are the world's best AI tutor and expert with extensive knowledge across a wide range of subjects.
        Answer the given question comprehensively, using clear and easy-to-understand language.
        Include detailed explanations, relevant examples, and structured information to ensure the answer is informative and well-organized.
        Format the answer with new line characters after approximately every 10-12 words to ensure the text is easily readable in a terminal interface.
        Do not include any introductory phrases like 'What a great question!' or 'Sure, I can help with that.'
        Please provide a concise and informative answer that addresses the question directly.
        Focus solely on providing a high-quality answer and avoid any unnecessary text.
        Question: ${prompt}
        Answer:
    `;

    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: detailedPrompt,
                }
            ],
            model: "llama3-8b-8192"
        });

        if (!response.choices || response.choices.length === 0) {
            throw new Error('No choices returned in the response');
        }

        const answer = response.choices[0].message.content.trim();
        const lines = answer.split('\n');
        let formattedAnswer = '\n\n';

        lines.forEach(line => {
            const words = line.split(' ');
            let currentSegment = '    ';
            words.forEach(word => {
                if ((currentSegment.length + word.length + 1) <= 150) {
                    currentSegment += word + ' ';
                } else {
                    formattedAnswer += '  ' + currentSegment.trim() + '\n';
                    currentSegment = word + ' ';
                }
            });
            formattedAnswer += '  ' + currentSegment.trim() + '\n';
        });

        formattedAnswer += '\n\n';
        return formattedAnswer;

    } catch (error) {
        console.error('Error querying LLM:', error);
        return 'An error occurred while fetching the response. Please try again.';
    }
}

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log("Ask a question (or type 'exit' to quit):");

    for await (const userInput of rl) {
        if (userInput.trim().toLowerCase() === 'exit') {
            rl.close();
            break;
        }
        const response = await queryLLM(userInput);
        console.log(response);
        console.log("\nAsk a question (or type 'exit' to quit):");
    }
}

main();

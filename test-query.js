const fetch = require('node-fetch');

async function testQuery(question) {
    try {
        const response = await fetch('http://localhost:3000/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: question })
        });
        
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Test questions
const questions = [
    "What is the petrol price in Mumbai?",
    "How many active drivers do we have?",
    "What are the average earnings of drivers?"
];

console.log('🚀 Starting tests...');
questions.forEach((question, index) => {
    console.log(`\nTest ${index + 1}: "${question}"`);
    testQuery(question);
});

const { GoogleGenerativeAI } = require('@google/generative-ai');

const ai = new GoogleGenerativeAI('AIzaSyDD8ka6-lGSX3JhBGFDSf3teB3_2AuRC80');

exports.generateContent = async (prompt) => { 
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt  +`give parameters as such teams skill match and challenging of the project (challenging and skill match are to be percentage parameters)`+ ` Generate a structured JSON array of project ideas...`);
    const response = await result.response;
    
    let responseText = response.text();

    // Remove backticks if present
    responseText = responseText.replace(/```json|```/g, '').trim();

    // Parse the cleaned JSON
    const ideas = JSON.parse(responseText);
    console.log(ideas);
    return ideas;
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content');
  }
};

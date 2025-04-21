const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Team = require('../models/Team');

const ai = new GoogleGenerativeAI('AIzaSyDD8ka6-lGSX3JhBGFDSf3teB3_2AuRC80');

exports.generateRoadmap = async (idea, userId) => {
  try {
    // Fetch current user's team and member details
    const currentUser = await User.findById(userId).populate('team');
    if (!currentUser || !currentUser.team) {
      throw new Error('User must be part of a team to generate roadmap');
    }

    const team = await Team.findById(currentUser.team._id).populate({
      path: 'members',
      select: 'name skills projects competitiveExperience'
    });

    const teamMembersDetails = team.members.map(member => ({
      name: member.name,
      role: member.competitiveExperience ? 'Experienced Developer' : 'Developer',
      skills: member.skills || []
    }));

    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `Based on the following hackathon project idea and team composition, generate a focused 36-hour development roadmap:

Title: ${idea.title}
Description: ${idea.description}
Tech Stack: ${idea.techStack ? idea.techStack.join(', ') : 'Not specified'}
Features: ${idea.features ? idea.features.join(', ') : 'Not specified'}
Team Members: ${teamMembersDetails.length > 0 ? teamMembersDetails.map(member => 
  `\n- ${member.name} (${member.role}): ${member.skills.join(', ')}`
).join('') : 'Not specified'}

Please provide a structured JSON response focusing on MVP features and demo preparation within a 36-hour hackathon timeframe. Consider the following when assigning tasks:

1. Match tasks with team members' skills and tech stack preferences
2. Assign complex tasks to experienced members
3. Provide learning opportunities for less experienced members
4. Balance workload based on experience level
5. Consider dependencies between tasks and team member expertise
6. Align technical requirements with team members' proficiencies

Provide the response in this format:
{
  "phases": [
    {
      "name": "Phase name (e.g. Setup, Core Features, Demo Prep)",
      "duration": "Duration in hours",
      "tasks": [
        {
          "title": "Task title",
          "assignedTo": "Team member name",
          "description": "Concise implementation steps",
          "estimatedHours": "Hours to complete (should be realistic for hackathon)",
          "priority": "High/Medium/Low"
        }
      ]
    }
  ],
  "memberTasks": {
    "memberName": {
      "role": "Team member's role",
      "todoList": [
        {
          "task": "Specific task description",
          "timeline": "When to work on this task",
          "dependencies": ["Any blocking tasks"],
          "priority": "High/Medium/Low"
        }
      ]
    }
  },
  "totalDuration": "36 hours",
  "demoPreparation": {
    "keyFeatures": ["List of features to showcase"],
    "presentationPoints": ["Key points to highlight in demo"],
    "technicalRequirements": ["Setup needed for demo"]
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();

    // Remove backticks if present
    responseText = responseText.replace(/```json|```/g, '').trim();

    // Parse the cleaned JSON
    const roadmap = JSON.parse(responseText);
    
    // Log the complete roadmap for debugging
    console.log('Generated Roadmap:', JSON.stringify(roadmap, null, 2));
    
    return roadmap;
  } catch (error) {
    console.error('Error generating roadmap:', error);
    throw new Error('Failed to generate roadmap');
  }
};
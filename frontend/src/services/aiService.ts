export async function simulateAIResponse(userMessage: string): Promise<string> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simple response simulation
  return `This is a simulated AI response to: "${userMessage}"\n\nI am a basic simulation for testing purposes.`;
}

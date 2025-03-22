import OpenAI from 'openai';

export async function enhanceCode(code: string, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error("OpenAI API key is required");
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.5-preview",
      messages: [
        {
          role: "system",
          content: `You are a code enhancement assistant. Your task is to improve the readability of TypeScript/JavaScript code by:
          1. Replacing generic variable names (result_0, result_1, etc.) with meaningful names based on their usage
          2. Preserving the exact functionality of the code
          3. Maintaining the same basic structure
          4. Only renaming variables, do not modify the logic or add comments
          5. Keep import statements unchanged
          
          Example input:
          const result_0 = await getUserBalance({ address });
          const result_1 = result_0 * 2;
          
          Example output:
          const userBalance = await getUserBalance({ address });
          const doubledBalance = userBalance * 2;`
        },
        {
          role: "user",
          content: `Please enhance this code by replacing generic variable names with meaningful names while preserving functionality:\n\n${code}`
        }
      ],
      temperature: 0.3,
    });

    if (!response.choices[0]?.message?.content) {
      throw new Error("No response from OpenAI");
    }

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error enhancing code:', error);
    throw error;
  }
}

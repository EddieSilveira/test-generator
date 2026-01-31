import { streamText, UIMessage, convertToModelMessages } from 'ai';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "anthropic/claude-sonnet-4.5",
    system: `You are a testing expert. Your rules:
            - Generate ONLY test code, no explanations outside the code
            - Use comments inside the code to explain each test
            - Always include edge cases
            - Generate mocks when necessary
            - Return code inside markdown code blocks
            - If the user doesn't specify a framework, use Vitest by default`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
import { z } from "zod";
import { aiChat } from "../index";
import { SyllabusDifficulty } from "@/types/enums";

const SyllabusSchema = z.object({
  topics: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      difficulty: z.nativeEnum(SyllabusDifficulty),
    }),
  ),
});

export async function generateTopicSyllabus(
  skill: string,
): Promise<z.infer<typeof SyllabusSchema>["topics"]> {
  const prompt = `Generate a comprehensive study syllabus for "${skill}".
List 9-12 essential topics (chapters) that cover everything from basics to advanced concepts.
For example, if skill is "JavaScript", include topics like "Variables & Scope", "Hoisting", "Closures", "Promises", "Event Loop", etc.

For each topic provide:
- id (slug-friendly, e.g., "hoisting")
- title (Display name)
- description (Short summary of what is covered)
- difficulty (Beginner, Intermediate, or Advanced)

Format as JSON object with "topics" array.
Return ONLY valid JSON. No markdown. No backticks. No explanation. No preamble.`;

  try {
    const result = await aiChat(prompt, {
      temperature: 0.3,
      responseFormat: "json_object",
    });
    const content = JSON.parse(result.content);
    return SyllabusSchema.parse(content).topics;
  } catch (error) {
    console.error("Failed to generate syllabus:", error);
    return [
      {
        id: "basics",
        title: `${skill} Basics`,
        description: "Core concepts",
        difficulty: SyllabusDifficulty.BEGINNER,
      },
      {
        id: "advanced",
        title: `Advanced ${skill}`,
        description: "Deep dive features",
        difficulty: SyllabusDifficulty.ADVANCED,
      },
    ];
  }
}

const GuideSchema = z.object({
  title: z.string(),
  content: z.string(), // Markdown content
  keyTakeaways: z.array(z.string()),
});

export async function generateTopicGuide(
  skill: string,
  topic: string,
): Promise<z.infer<typeof GuideSchema>> {
  const prompt = `Create a comprehensive deep-dive study guide for the topic "${topic}" in the context of "${skill}".

The output should include:
1. A clear, in-depth explanation of the concept (using Markdown).
2. Code examples demonstrating the concept (using Markdown code blocks).
3. Common pitfalls or interview "gotchas".
4. Real-world use cases.

Format as JSON:
{
  "title": "Topic Title",
  "content": "Full markdown content string...",
  "keyTakeaways": ["point 1", "point 2", ...]
}
Return ONLY valid JSON. No markdown. No backticks. No explanation. No preamble.`;

  try {
    const result = await aiChat(prompt, {
      temperature: 0.3,
      responseFormat: "json_object",
    });
    const content = JSON.parse(result.content);
    return GuideSchema.parse(content);
  } catch (error) {
    console.error("Failed to generate guide:", error);
    return {
      title: topic,
      content: `Failed to generate guide for **${topic}**. Please try again later.`,
      keyTakeaways: [],
    };
  }
}

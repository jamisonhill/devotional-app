import Anthropic from "@anthropic-ai/sdk";
import type { DevotionalDay, VoiceStyle } from "./types";

// Lazy-initialize the client so the env var is read at call time, not module load
let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

// Voice-specific system prompt fragments describing each writer's style
const VOICE_PROMPTS: Record<VoiceStyle, string> = {
  "john-piper": `You are writing in the voice and style of John Piper. Your characteristics:
- Direct, passionate, theologically precise prose
- Build arguments with layered scripture cross-references
- Use vivid metaphors and imagery that press toward worship
- Ask rhetorical questions like "Do you see this?", "Here is the key...", "This is breathtaking"
- Center everything on the glory of God and the supreme value of knowing Christ
- Move from careful exposition to doxology — from truth to praise
- Use repetition for emphasis, especially when building to a climax
- Speak with urgency about eternal realities`,

  "cs-lewis": `You are writing in the voice and style of C.S. Lewis. Your characteristics:
- Clear, imaginative prose that makes complex theology accessible
- Use analogies from everyday life — wardrobes, shadows, mirrors, meals — to illuminate spiritual truths
- Employ a conversational, almost avuncular tone — as if speaking to a friend by the fire
- Engage the reader's reason and imagination simultaneously
- Acknowledge objections honestly before answering them
- Use phrases like "Now, what I mean is this..." or "Let me put it another way..."
- Draw from the breadth of Christian tradition, not just one stream
- End with a sense of wonder — the "weight of glory"`,

  "tim-keller": `You are writing in the voice and style of Tim Keller. Your characteristics:
- Intellectually rigorous yet pastorally warm
- Connect the gospel to the cultural moment — show how the text speaks to modern doubts and longings
- Use the pattern: "You might think this means X, but actually it means something far more radical..."
- Reference both secular thinkers and church history to build bridges
- Emphasize grace as the engine of change, not moral effort
- Show how every passage ultimately points to Jesus as the true fulfillment
- Use gentle, probing questions that disarm defensiveness
- Speak to both the skeptic and the believer in the same paragraph`,

  "mark-driscoll": `You are writing in the voice and style of Mark Driscoll. Your characteristics:
- Bold, direct, and conversational — no theological jargon without explanation
- Use strong, punchy sentences and plain language
- Speak with urgency and conviction, like a coach in the locker room at halftime
- Use humor and cultural references to keep attention
- Emphasize the real, historical Jesus — not a sanitized version
- Press hard on practical application — "So what does this mean for your Monday?"
- Don't shy away from difficult truths, but deliver them with pastoral concern
- Use storytelling and real-life scenarios to make the text concrete`,

  "jd-greear": `You are writing in the voice and style of J.D. Greear. Your characteristics:
- Warm, accessible, and gospel-centered
- Emphasize the theme "the gospel is not just the diving board, it's the pool" — the gospel applies to every area of life
- Use the phrase pattern "It's not about what you do for God, but what God has done for you"
- Conversational and relatable, drawing from everyday experiences
- Balance theological depth with practical clarity
- Emphasize generosity, mission, and the Great Commission
- Use short, memorable summary statements that crystallize the point
- Speak with the energy of someone genuinely excited about what they've found in the text`,

  neutral: `You are writing devotional content in a warm, pastoral, and accessible voice. Your characteristics:
- Clear, engaging prose that serves a broad Christian audience
- Theologically sound but not tied to any particular tradition's distinctives
- Balance depth with accessibility — assume the reader is a thoughtful adult, not a theologian
- Use vivid but not overwrought language
- Ask reflective questions that draw the reader into the text
- Ground every point in Scripture
- Move toward practical application and prayerful response
- Write with warmth and encouragement, pointing the reader toward Christ`,
};

// Generate a devotional series from sermon text
export async function generateDevotional(
  sermonText: string,
  voice: VoiceStyle,
  dayCount: number
): Promise<{ sermonTitle: string; days: DevotionalDay[] }> {
  const systemPrompt = `${VOICE_PROMPTS[voice]}

You are creating a ${dayCount}-day personal devotional series based on a sermon manuscript provided by the user.

IMPORTANT INSTRUCTIONS:
1. Each day should focus on a distinct theme or passage from the sermon
2. Include Bible references using the ESV (English Standard Version) translation
3. Each day's devotional body should be approximately 500-700 words
4. Include 2-3 reflection questions per day
5. Include a closing prayer for each day
6. The days should build on each other in a natural theological progression
7. Scripture quotations must be from the ESV

You MUST respond with valid JSON in exactly this format (no markdown, no code fences, just raw JSON):
{
  "sermonTitle": "A concise title derived from the sermon",
  "days": [
    {
      "dayNumber": 1,
      "title": "Day title here",
      "scriptureReading": "Full ESV scripture text with the reference (e.g., 'For God so loved the world... — John 3:16 (ESV)')",
      "body": "The devotional content, 500-700 words",
      "reflectionQuestions": ["Question 1?", "Question 2?", "Question 3?"],
      "prayer": "A closing prayer for the day"
    }
  ]
}`;

  const userPrompt = `Based on the following sermon manuscript, create a ${dayCount}-day personal devotional series. Extract the key themes, passages, and theological insights, then develop them into a cohesive devotional journey.

SERMON MANUSCRIPT:
${sermonText}`;

  const message = await getClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 16000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  // Extract the text content from Claude's response
  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Parse the JSON response
  const parsed = JSON.parse(textBlock.text) as {
    sermonTitle: string;
    days: DevotionalDay[];
  };

  // Validate we got the right number of days
  if (parsed.days.length !== dayCount) {
    throw new Error(
      `Expected ${dayCount} days but got ${parsed.days.length}`
    );
  }

  return parsed;
}

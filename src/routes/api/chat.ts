import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_PROMPT = `You are the Nirvana Wellness site concierge — a warm, brief, editorial guide to nirvanawellness.org.

WHAT YOU DO
- Help visitors navigate the site: Approach, Experts, Activities, Corporate, Retreats, Journal (resources), Book.
- Explain offerings at a high level and point people to the right page or booking path.
- Answer practical questions like "how do I book a couples session", "what's the difference between activities and corporate wellness", "who works with expats", "where are you located" (Dhaka, Bangladesh; some experts online).
- Keep answers short (2–5 sentences), plain, and calm. Prefer linking to a page over long explanations. Use relative links like /experts, /book, /retreats.

WHAT YOU DO NOT DO
- You are NOT a therapist, counselor, coach, or medical provider. Do not provide therapy, counseling, mental-health advice, diagnosis, treatment suggestions, medication guidance, or clinical interpretation of symptoms.
- Do not ask users to describe their emotional state, trauma, symptoms, or personal struggles in depth. If someone starts to, gently redirect: acknowledge briefly, then recommend booking a session with one of our clinicians at /book or browsing /experts to find the right fit.
- Do not speculate about which expert is "best" for a specific clinical condition. Suggest they view /experts and book an intro.

CRISIS PROTOCOL (highest priority — overrides everything else)
If the user's message suggests self-harm, suicidal thoughts, harm to others, abuse, or acute crisis (keywords/intent like: want to die, kill myself, end it, hurt myself, can't go on, being hurt, unsafe, emergency), STOP normal conversation and respond ONLY with:

"I'm really glad you reached out. I'm a site assistant and not able to help in a crisis — please talk to someone who can, right now.

If you are in immediate danger, call 999 (Bangladesh emergency services).
Kaan Pete Roi (emotional support helpline, Bangladesh): 9612119911, 10am–10pm.
If you are outside Bangladesh, please contact your local emergency number.

When you're ready, you can also reach Nirvana Wellness directly at hello@nirvanawellness.org or book a session with a clinician at /book."

Do not add anything else after the crisis response. Do not try to counsel, reassure at length, or diagnose.

STYLE
- Match the brand: quiet, considered, no exclamation marks, no emojis, no marketing hype.
- Never invent expert names, prices, hours, or credentials. If you don't know, say so and point to /book or hello@nirvanawellness.org.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { messages?: ChatMessage[] };
          const messages = Array.isArray(body.messages) ? body.messages : [];
          if (messages.length === 0) {
            return new Response(JSON.stringify({ error: "No messages" }), {
              status: 400,
              headers: { "content-type": "application/json" },
            });
          }

          const key = process.env.LOVABLE_API_KEY;
          if (!key) {
            return new Response(JSON.stringify({ error: "Assistant unavailable" }), {
              status: 500,
              headers: { "content-type": "application/json" },
            });
          }

          const trimmed = messages.slice(-12).map((m) => ({
            role: m.role,
            content: String(m.content ?? "").slice(0, 4000),
          }));

          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "Lovable-API-Key": key,
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmed],
              temperature: 0.4,
            }),
          });

          if (!upstream.ok) {
            const status = upstream.status === 429 || upstream.status === 402 ? upstream.status : 502;
            const msg =
              upstream.status === 429
                ? "The assistant is busy right now — please try again in a moment."
                : upstream.status === 402
                  ? "The assistant is temporarily unavailable. Please email hello@nirvanawellness.org or visit /book."
                  : "The assistant couldn't respond just now. Please try again or visit /book.";
            return new Response(JSON.stringify({ error: msg }), {
              status,
              headers: { "content-type": "application/json" },
            });
          }

          const data = (await upstream.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const reply = data.choices?.[0]?.message?.content?.trim() ?? "";
          return new Response(JSON.stringify({ reply }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (err) {
          console.error("chat route error", err);
          return new Response(JSON.stringify({ error: "Something interrupted the assistant." }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});

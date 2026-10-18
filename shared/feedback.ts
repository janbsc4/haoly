import { z } from "zod";

export const FEEDBACK_MAX_MESSAGE = 2000;
export const FEEDBACK_IP_HOURLY_LIMIT = 5;
export const FEEDBACK_GLOBAL_DAILY_LIMIT = 50;

export const feedbackKinds = ["bug", "idea", "other"] as const;
export type FeedbackKind = (typeof feedbackKinds)[number];

export const feedbackRequestSchema = z
  .object({
    kind: z.enum(feedbackKinds),
    message: z.string().trim().min(1).max(FEEDBACK_MAX_MESSAGE),
    locale: z.enum(["en", "es"]),
    // The study route and tab tell a bug report where the learner was.
    context: z.string().trim().max(200),
  })
  .strict();

export type FeedbackRequest = z.infer<typeof feedbackRequestSchema>;

const kindTitle: Record<FeedbackKind, string> = { bug: "Bug", idea: "Idea", other: "Feedback" };

// Learner text goes into an issue in a private repo; break @mentions so a
// message cannot ping GitHub users.
function defuseMentions(text: string) {
  return text.replace(/@/g, "@​");
}

export function feedbackIssue(request: FeedbackRequest, userAgent: string) {
  const firstLine = request.message.split("\n")[0].slice(0, 70);
  return {
    title: defuseMentions(`[${kindTitle[request.kind]}] ${firstLine}`),
    body: [
      defuseMentions(request.message),
      "",
      "---",
      `Locale: ${request.locale}`,
      `Context: ${defuseMentions(request.context) || "-"}`,
      `User agent: ${defuseMentions(userAgent.slice(0, 300)) || "-"}`,
    ].join("\n"),
  };
}

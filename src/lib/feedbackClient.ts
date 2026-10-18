import type { FeedbackRequest } from "../../shared/feedback";

// Feedback shares the Léi Worker, so it is available wherever Converse is deployed.
export function feedbackEndpoint(): string | null {
  const chat = import.meta.env.PUBLIC_CHAT_API_URL;
  return chat ? new URL("/feedback", chat).href : null;
}

export async function sendFeedback(request: FeedbackRequest): Promise<void> {
  const endpoint = feedbackEndpoint();
  if (!endpoint) throw new Error("Feedback is not configured.");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok)
    throw Object.assign(new Error("Feedback could not be sent."), {
      code: response.status === 429 ? "feedback/rate-limited" : "feedback/unavailable",
    });
}

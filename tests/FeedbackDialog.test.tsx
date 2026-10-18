import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FeedbackDialog } from "../src/components/FeedbackDialog";
import { messages } from "../src/lib/messages";

beforeEach(() => {
  vi.stubEnv("PUBLIC_CHAT_API_URL", "https://lei.example/conversation");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function renderDialog() {
  render(
    <FeedbackDialog m={messages.en.feedback} locale="en" context="/study/en/ · study" onClose={vi.fn()} />,
  );
}

it("sends a bug report with its context to the Worker feedback route", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
  renderDialog();
  const send = screen.getByRole("button", { name: "Send" });
  expect(send).toBeDisabled();
  await userEvent.type(screen.getByRole("textbox", { name: "Message" }), "The card froze");
  await userEvent.click(send);
  expect(await screen.findByRole("status")).toHaveTextContent("Thanks! Your feedback arrived.");
  const [url, init] = vi.mocked(fetch).mock.calls[0];
  expect(url).toBe("https://lei.example/feedback");
  expect(JSON.parse(init?.body as string)).toEqual({
    kind: "bug", message: "The card froze", locale: "en", context: "/study/en/ · study",
  });
});

it("tells the learner to wait when the Worker rate-limits feedback", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 429 })));
  renderDialog();
  await userEvent.click(screen.getByRole("radio", { name: "Idea" }));
  await userEvent.type(screen.getByRole("textbox", { name: "Message" }), "Dark mode");
  await userEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("try again in an hour");
});

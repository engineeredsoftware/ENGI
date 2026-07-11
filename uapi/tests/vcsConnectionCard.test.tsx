import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { VCSConnectionCard } from "@/components/bitcode/vcs/VCSConnectionCard";

// V48-Gate3-F34: when a stored GitHub connection is Invalid, Refresh already
// silently retries installation-token regeneration (V48-Gate3-F33) — but if
// regeneration itself keeps failing, the card used to show only "Invalid"
// with no way to tell why, indistinguishable from a genuinely revoked
// installation. This suite pins the new diagnostic surfacing.

function mockConnectionFetch(payload: Record<string, unknown>) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    json: async () => payload,
  }) as unknown as typeof fetch;
}

describe("VCSConnectionCard — regeneration-failure diagnostic (V48-Gate3-F34)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows nothing extra when the connection is valid", async () => {
    mockConnectionFetch({
      connected: true,
      valid: true,
      username: "bitcode",
      metadata: {},
    });

    render(<VCSConnectionCard provider="github" />);

    await screen.findByText("bitcode");
    expect(screen.queryByText(/Last reconnect attempt failed/i)).not.toBeInTheDocument();
  });

  it("surfaces the source-safe regeneration failure reason when invalid", async () => {
    mockConnectionFetch({
      connected: true,
      valid: false,
      username: "advancedengineeredsoftware",
      metadata: {
        last_regeneration_error: "Failed to generate installation token: 404 Not Found",
      },
    });

    render(<VCSConnectionCard provider="github" />);

    await screen.findByText(/Last reconnect attempt failed/i);
    expect(
      screen.getByText(/Failed to generate installation token: 404 Not Found/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Try Disconnect below, then reconnect/i),
    ).toBeInTheDocument();
  });

  it("maps the missing-credentials reason to a clear message without the reinstall hint", async () => {
    mockConnectionFetch({
      connected: true,
      valid: false,
      username: "advancedengineeredsoftware",
      metadata: {
        last_regeneration_error: "github_app_credentials_not_configured",
      },
    });

    render(<VCSConnectionCard provider="github" />);

    await screen.findByText(/Last reconnect attempt failed/i);
    expect(
      screen.getByText(/GitHub App credentials are not configured/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Try Disconnect below, then reconnect/i),
    ).not.toBeInTheDocument();
  });

  it("shows nothing extra when invalid but no diagnostic has been recorded yet", async () => {
    mockConnectionFetch({
      connected: true,
      valid: false,
      username: "advancedengineeredsoftware",
      metadata: {},
    });

    render(<VCSConnectionCard provider="github" />);

    await waitFor(() => expect(screen.getByText("Invalid")).toBeInTheDocument());
    expect(screen.queryByText(/Last reconnect attempt failed/i)).not.toBeInTheDocument();
  });
});

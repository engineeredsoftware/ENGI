import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { VCSConnectionCard } from "@/components/bitcode/vcs/VCSConnectionCard/VCSConnectionCard";

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
      screen.getByText(/bitcode-github-auxiliary/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Clear the dead connection, then Install GitHub App again/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId("vcs-connection-clear-dead")).toBeInTheDocument();
    expect(screen.queryByTestId("vcs-connection-disconnect")).not.toBeInTheDocument();
  });

  it("maps the missing-credentials reason to a clear message and clear-dead CTA", async () => {
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
    expect(screen.getByTestId("vcs-connection-clear-dead")).toBeInTheDocument();
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
    expect(screen.getByTestId("vcs-connection-disconnect")).toBeInTheDocument();
  });

  it("clears a dead installation without the confirm dialog", async () => {
    mockConnectionFetch({
      connected: true,
      valid: false,
      username: "advancedengineeredsoftware",
      metadata: {
        last_regeneration_error:
          'Failed to generate installation token: 404 {"message":"Integration not found"}',
      },
    });

    render(<VCSConnectionCard provider="github" />);
    await screen.findByTestId("vcs-connection-clear-dead");

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({ success: true, disconnected: true }),
    });

    const { fireEvent } = await import("@testing-library/react");
    fireEvent.click(screen.getByTestId("vcs-connection-clear-dead"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/vcs/github/connection",
        expect.objectContaining({ method: "DELETE", credentials: "same-origin" }),
      );
    });
  });
});

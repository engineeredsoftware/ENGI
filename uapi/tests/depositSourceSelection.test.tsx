import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import DepositSourceSelection from "@/app/deposits/DepositSourceSelection";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(""),
}));

function mockVcsFetch(options: { connectionValid?: boolean } = {}) {
  const connectionValid = options.connectionValid ?? true;
  global.fetch = jest.fn((input: unknown) => {
    const url = String(input);
    if (url.includes("/connection")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ connected: true, valid: connectionValid }),
      });
    }
    if (url.includes("/repositories")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ repositories: [], inventorySource: "live" }),
      });
    }
    return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
  }) as unknown as typeof fetch;
}

describe("DepositSourceSelection — V48-Gate3-F17 repository anchoring", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    mockReplace.mockReset();
  });

  it("renders no anchor selector when there are no anchors", async () => {
    mockVcsFetch();
    render(
      <DepositSourceSelection
        routePath="/"
        buildRouteHref={(params) => `/deposits?${params?.toString() ?? ""}`}
      />,
    );

    await screen.findByLabelText("Repository provider");
    expect(
      screen.queryByRole("combobox", {
        name: "Load a previously anchored repository",
      }),
    ).not.toBeInTheDocument();
  });

  it("offers previously anchored repositories and applies the selected one", async () => {
    mockVcsFetch();
    render(
      <DepositSourceSelection
        routePath="/"
        buildRouteHref={(params) => `/deposits?${params?.toString() ?? ""}`}
        repositoryAnchors={[
          {
            id: "repo-anchor-1",
            repositoryFullName: "engineeredsoftware/OtherRepo",
            branch: "develop",
            commit: "abc1234567",
          },
        ]}
      />,
    );

    const anchorSelect = await screen.findByRole("combobox", {
      name: "Load a previously anchored repository",
    });
    fireEvent.click(anchorSelect);
    const listbox = await screen.findByRole("listbox");
    fireEvent.click(
      within(listbox).getByText("engineeredsoftware/OtherRepo"),
    );

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("repo=engineeredsoftware%2FOtherRepo"),
        { scroll: false },
      ),
    );
    const lastHref = String(mockReplace.mock.calls.at(-1)?.[0] ?? "");
    expect(lastHref).toContain("sourceBranch=develop");
    expect(lastHref).toContain("sourceCommit=abc1234567");
  });

  it("clears branch/commit when the anchor carries no branch or commit", async () => {
    mockVcsFetch();
    render(
      <DepositSourceSelection
        routePath="/"
        buildRouteHref={(params) => `/deposits?${params?.toString() ?? ""}`}
        repositoryAnchors={[
          {
            id: "repo-anchor-2",
            repositoryFullName: "engineeredsoftware/Bare",
            branch: null,
            commit: null,
          },
        ]}
      />,
    );

    fireEvent.click(
      await screen.findByRole("combobox", {
        name: "Load a previously anchored repository",
      }),
    );
    const listbox = await screen.findByRole("listbox");
    fireEvent.click(within(listbox).getByText("engineeredsoftware/Bare"));

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("repo=engineeredsoftware%2FBare"),
        { scroll: false },
      ),
    );
    const lastHref = String(mockReplace.mock.calls.at(-1)?.[0] ?? "");
    expect(lastHref).not.toContain("sourceBranch=");
    expect(lastHref).not.toContain("sourceCommit=");
  });
});

describe("DepositSourceSelection — stale connection surfaces a reconnect notice (repro: branch/commit silently stuck empty)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    mockReplace.mockReset();
  });

  it("shows no reconnect notice when the connection is connected and valid", async () => {
    mockVcsFetch({ connectionValid: true });
    render(
      <DepositSourceSelection
        routePath="/"
        buildRouteHref={(params) => `/deposits?${params?.toString() ?? ""}`}
      />,
    );

    await screen.findByLabelText("Repository provider");
    expect(
      screen.queryByText(/needs to reconnect/i),
    ).not.toBeInTheDocument();
  });

  it("surfaces a reconnect notice (and why Branch/Commit stay empty) when connected but not valid", async () => {
    mockVcsFetch({ connectionValid: false });
    render(
      <DepositSourceSelection
        routePath="/"
        buildRouteHref={(params) => `/deposits?${params?.toString() ?? ""}`}
      />,
    );

    await screen.findByText(/needs to reconnect/i);
    expect(
      screen.getByRole("button", { name: /Reconnect GitHub/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Reconnect required to load branches/i)).toBeInTheDocument();
    expect(screen.getByText(/Reconnect required to load commits/i)).toBeInTheDocument();
  });
});

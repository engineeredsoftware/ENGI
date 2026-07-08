import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import DepositSourceSelection from "@/app/deposits/DepositSourceSelection";

const mockReplace = jest.fn();
let mockSearchParams = new URLSearchParams("");

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));

function mockVcsFetch(
  options: {
    connectionValid?: boolean;
    repositories?: Array<{ fullName: string; name: string; defaultBranch?: string }>;
    branches?: Array<{ name: string }>;
    commits?: Array<{ sha: string; message: string }>;
  } = {},
) {
  const connectionValid = options.connectionValid ?? true;
  const repositories = options.repositories ?? [];
  const branches = options.branches ?? [];
  const commits = options.commits ?? [];
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
        json: async () => ({
          repositories: repositories.map((repository) => ({
            id: repository.fullName,
            name: repository.name,
            fullName: repository.fullName,
            defaultBranch: repository.defaultBranch || "main",
            private: false,
            url: `https://github.com/${repository.fullName}`,
          })),
          inventorySource: "live",
        }),
      });
    }
    if (url.includes("resource=branches")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          branches,
          defaultBranch: branches[0]?.name || "main",
        }),
      });
    }
    if (url.includes("resource=commits")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          commits: commits.map((commit) => ({
            ...commit,
            author: {
              name: "Dev",
              email: "dev@example.com",
              date: new Date("2026-05-14T00:00:00.000Z"),
            },
            parents: [],
          })),
        }),
      });
    }
    return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
  }) as unknown as typeof fetch;
}

describe("DepositSourceSelection — V48-Gate3-F17 repository anchoring", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    mockReplace.mockReset();
    mockSearchParams = new URLSearchParams("");
  });

  it("defaults commit selection to Latest and refreshes head on demand", async () => {
    mockSearchParams = new URLSearchParams(
      "provider=github&repo=engineeredsoftware/ENGI&sourceBranch=main",
    );
    mockVcsFetch({
      repositories: [
        {
          fullName: "engineeredsoftware/ENGI",
          name: "ENGI",
          defaultBranch: "main",
        },
      ],
      branches: [{ name: "main" }],
      commits: [
        { sha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", message: "head commit" },
        { sha: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", message: "older" },
      ],
    });

    render(
      <DepositSourceSelection
        routePath="/deposits"
        buildRouteHref={(params) => `/deposits?${params?.toString() ?? ""}`}
      />,
    );

    // Wait for commits to load so the select is enabled and Latest resolves.
    await waitFor(() => {
      const fetchMock = global.fetch as jest.Mock;
      expect(
        fetchMock.mock.calls.some((call) =>
          String(call[0]).includes("resource=commits"),
        ),
      ).toBe(true);
    });

    const commitSelect = await screen.findByRole("combobox", {
      name: "Repository source commit",
    });
    await waitFor(() =>
      expect(
        within(commitSelect).getByText(/Latest · aaaaaaa/i),
      ).toBeInTheDocument(),
    );

    // Refresh control is always available once a branch is selected.
    const refresh = await screen.findByRole("button", {
      name: "Refresh commits list",
    });
    const fetchMock = global.fetch as jest.Mock;
    const commitsBefore = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes("resource=commits"),
    ).length;
    fireEvent.click(refresh);
    // Soft refresh: list stays painted (Latest · sha still visible) while
    // a new commits fetch is issued.
    expect(
      within(commitSelect).getByText(/Latest · aaaaaaa/i),
    ).toBeInTheDocument();
    await waitFor(() => {
      const commitsAfter = fetchMock.mock.calls.filter((call) =>
        String(call[0]).includes("resource=commits"),
      ).length;
      expect(commitsAfter).toBeGreaterThan(commitsBefore);
    });
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Refresh commits list" }),
      ).not.toBeDisabled(),
    );
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
    expect(screen.getAllByText(/Reconnect required/i).length).toBeGreaterThanOrEqual(2);
  });
});

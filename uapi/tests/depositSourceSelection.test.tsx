import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import DepositSourceSelection from "@/app/deposits/DepositSourceSelection";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(""),
}));

function mockVcsFetch() {
  global.fetch = jest.fn((input: unknown) => {
    const url = String(input);
    if (url.includes("/connection")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ connected: true, valid: true }),
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

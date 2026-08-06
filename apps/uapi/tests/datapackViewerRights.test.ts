import {
  buildDataPackCommercialBriefDownload,
  resolveDataPackDownloads,
  resolveDataPackViewerRole,
} from "@/components/datapacks/models/datapack-viewer-rights";

describe("datapack viewer rights", () => {
  it("resolves depositor and post-settled purchaser", () => {
    expect(
      resolveDataPackViewerRole({
        viewerUserId: "user-a",
        depositorUserId: "user-a",
      }),
    ).toBe("depositor");
    expect(
      resolveDataPackViewerRole({
        viewerUserId: "buyer-1",
        settledBuyerUserId: "buyer-1",
        settlementState: "settled",
      }),
    ).toBe("post-settled-purchaser");
    expect(
      resolveDataPackViewerRole({
        viewerUserId: "other",
        depositorUserId: "seller",
      }),
    ).toBe("pre-purchaser");
  });

  it("gates downloads by role", () => {
    const pre = resolveDataPackDownloads("pre-purchaser");
    expect(pre.find((d) => d.kind === "source-patch")?.allowed).toBe(false);
    expect(pre.find((d) => d.kind === "commercial-brief")?.allowed).toBe(true);
    expect(pre.find((d) => d.kind === "entitled-delivery")?.allowed).toBe(false);

    const dep = resolveDataPackDownloads("depositor");
    expect(dep.find((d) => d.kind === "source-patch")?.allowed).toBe(true);
    expect(dep.find((d) => d.kind === "metadata-review")?.allowed).toBe(true);

    const post = resolveDataPackDownloads("post-settled-purchaser");
    expect(post.find((d) => d.kind === "source-patch")?.allowed).toBe(true);
    expect(post.find((d) => d.kind === "entitled-delivery")?.allowed).toBe(true);
  });

  it("builds source-safe commercial brief without bodies", () => {
    const file = buildDataPackCommercialBriefDownload({
      optionId: "opt-1",
      title: "Auth capability",
      commercialTitle: "Session auth knowledge pack",
      commercialDescription:
        "Buyer-legible description of session auth capability with measurements and path scope only.",
      kind: "capability-slice",
    });
    expect(file.filename).toContain("session-auth");
    expect(file.mimeType).toBe("application/json");
    const parsed = JSON.parse(file.body);
    expect(parsed.disclosure.containsFileBodies).toBe(false);
    expect(parsed.commercialTitle).toContain("Session auth");
  });
});

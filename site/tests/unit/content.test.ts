import { describe, expect, it } from "vitest";
import { NAV, SITE } from "@/content";

describe("site content", () => {
  it("every nav anchor points at a section the page renders", () => {
    // The E2E proves this against the DOM; this test is the fast feedback loop
    // for anyone editing NAV.
    expect(NAV.length).toBeGreaterThan(0);
    for (const item of NAV) {
      expect(item.href.startsWith("/#"), `${item.label} is not an on-page anchor`).toBe(true);
      expect(item.label.length).toBeGreaterThan(0);
    }
  });

  it("nav labels are unique", () => {
    const labels = NAV.map((item) => item.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("points at the real repository and resume", () => {
    expect(SITE.repo).toMatch(/^https:\/\/github\.com\//);
    expect(SITE.resume).toBe("https://marcelinosandroni.com");
    expect(SITE.package).toBe("create-sdd-ai-stack");
  });

  it("has a complete author record", () => {
    expect(SITE.author.name).toBeTruthy();
    expect(SITE.author.email).toMatch(/@/);
    expect(SITE.author.github).toMatch(/^https:\/\/github\.com\//);
    expect(SITE.author.linkedin).toMatch(/^https:\/\/www\.linkedin\.com\//);
  });
});

import { encodeURL } from "../src";

describe("encodeURL", () => {
  describe("ActionRequestURL", () => {
    it("encodes a URL without action params", () => {
      const link = "https://example.com/api/action";

      const url = encodeURL({ link: new URL(link) });

      expect(String(url)).toBe(`solana-action:${link}`);
    });

    it("encodes a URL with additional action params", () => {
      const link = "https://example.com/api/action";
      const label = "label";
      const message = "message";

      const url = encodeURL({ link: new URL(link), label, message });

      expect(String(url)).toBe(
        `solana-action:${link}?label=${label}&message=${message}`,
      );
    });

    it("encodes a URL with query parameters", () => {
      const link = "https://example.com/api/action?query=param";

      const url = encodeURL({ link: new URL(link) });

      expect(String(url)).toBe(`solana-action:${encodeURIComponent(link)}`);
    });

    it("encodes a URL with query parameters AND action params", () => {
      const link = "https://example.com/api/action?query=param&amount=1337";
      const label = "label";
      const message = "message";

      const url = encodeURL({ link: new URL(link), label, message });

      expect(String(url)).toBe(
        `solana-action:${encodeURIComponent(
          link,
        )}?label=${label}&message=${message}`,
      );
    });
  });

  describe("blink URLs", () => {
    it("encodes a URL without action params", () => {
      const blink = "https://blink.com/";
      const link = "https://action.com/api/action";

      const url = encodeURL({
        blink: new URL(blink),
        action: {
          link: new URL(link),
        },
      });

      expect(String(url.searchParams.get("action"))).toBe(
        encodeURIComponent(`solana-action:${link}`),
      );
    });

    it("encodes a URL with action params", () => {
      const blink = "https://blink.com/";
      const link = "https://action.com/api/action?query=param";

      const url = encodeURL({
        blink: new URL(blink),
        action: {
          link: new URL(link),
        },
      });

      expect(String(url.searchParams.get("action"))).toBe(
        encodeURIComponent(`solana-action:${encodeURIComponent(link)}`),
      );
    });

    it("encodes a URL with query params AND without action params", () => {
      const blink = "https://blink.com/?other=one";
      const link = "https://action.com/api/action";

      const url = encodeURL({
        blink: new URL(blink),
        action: {
          link: new URL(link),
        },
      });

      expect(String(url.searchParams.get("action"))).toBe(
        encodeURIComponent(`solana-action:${link}`),
      );
    });

    it("encodes a URL with query params AND with action params", () => {
      const blink = "https://blink.com/?other=one";
      const link = "https://action.com/api/action?query=param";

      const url = encodeURL({
        blink: new URL(blink),
        action: {
          link: new URL(link),
        },
      });

      expect(String(url.searchParams.get("action"))).toBe(
        encodeURIComponent(`solana-action:${encodeURIComponent(link)}`),
      );
    });
  });
});

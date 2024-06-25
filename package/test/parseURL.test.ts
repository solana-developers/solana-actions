import { ActionRequestURLFields, BlinkURLFields, parseURL } from "../src";

describe("parseURL", () => {
  describe("parsing actions", () => {
    it("should allow solana pay protocol", () => {
      const url = "solana:https://example.com/api/action";

      const { link } = parseURL(url) as ActionRequestURLFields;

      expect(link.toString()).toBe("https://example.com/api/action");
    });

    it("should allow solana action protocol", () => {
      const url = "solana-action:https://example.com/api/action";

      const { link } = parseURL(url) as ActionRequestURLFields;

      expect(link.toString()).toBe("https://example.com/api/action");
    });

    describe("when given correct params", () => {
      it("should parse simple action URL", () => {
        const url = "solana-action:https://example.com/api/action";

        const { link } = parseURL(url) as ActionRequestURLFields;

        expect(link.toString()).toBe("https://example.com/api/action");
      });

      it("should parse action URL with action params", () => {
        const url =
          "solana-action:https%3A%2F%2Fexample.com%2Fapi%2Faction%3Famount%3D1337%26another%3Dyes";

        const { link } = parseURL(url) as ActionRequestURLFields;

        expect(link.toString()).toBe(
          "https://example.com/api/action?amount=1337&another=yes",
        );
      });

      it("should parse action URL with extra action params", () => {
        const url =
          "solana-action:https://example.com/api/action?label=Michael&message=Thanks%20for%20all%20the%20fish";

        const { link, label, message } = parseURL(
          url,
        ) as ActionRequestURLFields;

        expect(link.toString()).toBe("https://example.com/api/action");
        expect(label).toBe("Michael");
        expect(message).toBe("Thanks for all the fish");
      });

      it("should parse action URL with query params AND with action params", () => {
        const url =
          "solana-action:https%3A%2F%2Fexample.com%2Fapi%2Faction%3Famount%3D1337%26another%3Dyes?label=Michael&message=Thanks%20for%20all%20the%20fish";

        const { link, label, message } = parseURL(
          url,
        ) as ActionRequestURLFields;

        expect(link.toString()).toBe(
          "https://example.com/api/action?amount=1337&another=yes",
        );
        expect(label).toBe("Michael");
        expect(message).toBe("Thanks for all the fish");
      });
    });
  });

  describe("parsing blinks URLs", () => {
    it("should parse blinks without action query params", () => {
      const actionLink = "https://action.com/api/action";
      const actionUrl = `solana-action:${encodeURIComponent(actionLink)}`;

      const url = `https://blink.com/?other=one&action=${encodeURIComponent(
        actionUrl,
      )}`;

      const { blink, action } = parseURL(url) as BlinkURLFields;

      expect(String(blink)).toBe(url);
      expect(String(blink.searchParams.get("action"))).toBe(actionUrl);
      expect(String(action.link)).toBe(actionLink);
    });

    it("should parse blinks without action query params", () => {
      const actionLink = "https://action.com/api/action";
      const actionUrl = `solana-action:${encodeURIComponent(
        actionLink,
      )}?label=Michael&message=Thanks%20for%20all%20the%20fish`;

      const url = `https://blink.com/?other=one&action=${encodeURIComponent(
        actionUrl,
      )}`;

      const { blink, action } = parseURL(url) as BlinkURLFields;

      expect(String(blink)).toBe(url);
      expect(String(blink.searchParams.get("action"))).toBe(actionUrl);
      expect(String(action.link)).toBe(actionLink);
      expect(String(action.label)).toBe("Michael");
      expect(String(action.message)).toBe("Thanks for all the fish");
    });

    it("should parse blinks with action query params", () => {
      const actionLink = "https://action.com/api/action?query=param";
      const actionUrl = `solana-action:${encodeURIComponent(actionLink)}`;

      const url = `https://blink.com/?other=one&action=${encodeURIComponent(
        actionUrl,
      )}`;

      const { blink, action } = parseURL(url) as BlinkURLFields;

      expect(String(blink)).toBe(url);
      expect(String(blink.searchParams.get("action"))).toBe(actionUrl);
      expect(String(action.link)).toBe(actionLink);
    });

    it("should parse blinks with action query params", () => {
      const actionLink = "https://action.com/api/action?query=param";
      const actionUrl = `solana-action:${encodeURIComponent(
        actionLink,
      )}?label=Michael&message=Thanks%20for%20all%20the%20fish`;

      const url = `https://blink.com/?other=one&action=${encodeURIComponent(
        actionUrl,
      )}`;

      const { blink, action } = parseURL(url) as BlinkURLFields;

      expect(String(blink)).toBe(url);
      expect(String(blink.searchParams.get("action"))).toBe(actionUrl);
      expect(String(action.link)).toBe(actionLink);
      expect(String(action.label)).toBe("Michael");
      expect(String(action.message)).toBe("Thanks for all the fish");
    });
  });

  describe("errors", () => {
    it("throws an error on invalid length", () => {
      const url = "X".repeat(2049);
      expect(() => parseURL(url)).toThrow("length invalid");
    });

    it("throws an error on invalid protocol", () => {
      const url = "eth:0xffff";
      expect(() => parseURL(url)).toThrow("protocol invalid");
    });

    it("throws an error on missing pathname", () => {
      const url = "solana-action:";
      expect(() => parseURL(url)).toThrow("pathname missing");
    });

    it("throws an error on invalid pathname", () => {
      const url = "solana-action:0xffff";
      expect(() => parseURL(url)).toThrow("pathname invalid");
    });

    it("throws an error on invalid blink urls", () => {
      // empty `action` param
      const url = "https://blink.com/?other=one&action=";
      expect(() => parseURL(url)).toThrow("invalid blink url");
    });

    it("throws an error on invalid protocol in the blink `action` param", () => {
      // using `unknown-protocol` vs `solana-action`
      const url =
        "https://blink.com/?other=one&action=unknown-protocol%3Ahttps%253A%252F%252Faction.com%252Fapi%252Faction%253Fquery%253Dparam";

      expect(() => parseURL(url)).toThrow("protocol invalid");
    });

    it("throws an error on invalid link in the blink `action` param", () => {
      // uses an ftp url
      const url =
        "https://blink.com/?other=one&action=solana-action%3Aftp%253A%252F%252Faction.com%252Fapi%252Faction%253Fquery%253Dparam";

      expect(() => parseURL(url)).toThrow("link invalid");
    });
  });
});

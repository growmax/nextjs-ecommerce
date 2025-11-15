import { getUserInitials } from "./general";

describe("getUserInitials", () => {
  describe("Unit Tests", () => {
    it("should generate initials from full name", () => {
      expect(getUserInitials("John Doe")).toBe("JD");
      expect(getUserInitials("Alice Bob Smith")).toBe("AB");
      expect(getUserInitials("First Middle Last")).toBe("FM");
    });

    it("should handle single name", () => {
      expect(getUserInitials("John")).toBe("J");
      expect(getUserInitials("A")).toBe("A");
    });

    it('should return "U" for empty or falsy input', () => {
      expect(getUserInitials("")).toBe("U");
      expect(getUserInitials(null as any)).toBe("U");
      expect(getUserInitials(undefined as any)).toBe("U");
    });

    it("should convert initials to uppercase", () => {
      expect(getUserInitials("john doe")).toBe("JD");
      expect(getUserInitials("a b c")).toBe("AB");
    });

    it("should handle names with multiple spaces", () => {
      expect(getUserInitials("John  Doe")).toBe("JD"); // double space
      expect(getUserInitials("  John  Doe  ")).toBe("JD"); // spaces around
    });

    it("should handle special characters and unicode in names", () => {
      expect(getUserInitials("José María")).toBe("JM");
      expect(getUserInitials("Nguyễn Văn A")).toBe("NV");
      expect(getUserInitials("John-Doe Smith")).toBe("JS");
    });

    it("should take only first two initials for names with multiple words", () => {
      expect(getUserInitials("Alpha Beta Gamma Delta")).toBe("AB");
      expect(getUserInitials("One Two Three Four Five")).toBe("OT");
    });

    it("should handle very long single word", () => {
      expect(getUserInitials("Supercalifragilisticexpialidocious")).toBe("S");
    });
  });

  describe("Integration-like Scenarios", () => {
    it("should work with real user data scenarios", () => {
      const users = [
        { name: "John Michael Doe", expected: "JM" },
        { name: "Sarah Chen", expected: "SC" },
        { name: "A", expected: "A" },
        { name: "", expected: "U" },
      ];

      users.forEach(user => {
        expect(getUserInitials(user.name)).toBe(user.expected);
      });
    });

    it("should handle names from different languages", () => {
      expect(getUserInitials("张三")).toBe("张");
      expect(getUserInitials("Иван Петров")).toBe("ИП");
      expect(getUserInitials("محمد أحمد")).toBe("مأ");
    });

    it("should work with names containing numbers and symbols", () => {
      expect(getUserInitials("John Doe 2nd")).toBe("JD");
      expect(getUserInitials("User@Name")).toBe("U");
      expect(getUserInitials("Test-User Name")).toBe("TN");
    });
  });
});

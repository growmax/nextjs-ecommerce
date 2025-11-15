export const decodeUnicode = (input: string): string => {
  if (!input || typeof input !== "string") {
    return input;
  }

  try {
    return input.replace(/\\u([0-9a-fA-F]{4})/g, (_match, hexCode) =>
      String.fromCharCode(parseInt(hexCode, 16))
    );
  } catch {
    return input;
  }
};

export const getUserInitials = (str: string) => {
  if (!str) return "U";
  return str
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

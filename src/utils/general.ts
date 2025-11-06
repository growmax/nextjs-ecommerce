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

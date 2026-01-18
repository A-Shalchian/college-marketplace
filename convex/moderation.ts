export type Blocklist = {
  drugs: string[];
  sexual: string[];
  weapons: string[];
  scam: string[];
  coded: string[];
};

export function checkContent(
  text: string,
  blocklist: Blocklist
): { flagged: boolean; flags: string[] } {
  const normalizedText = text.toLowerCase();
  const flags: string[] = [];

  for (const [category, keywords] of Object.entries(blocklist)) {
    for (const keyword of keywords) {
      const regex = new RegExp(
        `\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i"
      );
      if (regex.test(normalizedText)) {
        flags.push(`${category}:${keyword}`);
      }
    }
  }

  return {
    flagged: flags.length > 0,
    flags,
  };
}

export function moderateContent(
  title: string,
  description: string,
  blocklist: Blocklist
): { status: string; flags: string[] } {
  const combinedText = `${title} ${description}`;
  const result = checkContent(combinedText, blocklist);

  if (result.flags.length >= 3) {
    return { status: "rejected", flags: result.flags };
  } else if (result.flagged) {
    return { status: "flagged", flags: result.flags };
  }

  return { status: "clean", flags: [] };
}

import xss from "xss";

const xssOptions = {
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style", "iframe", "object", "embed"],
};

export const sanitizeText = (value: string): string => {
  return xss(value, xssOptions).trim();
};

export const sanitizeOptional = (value?: string): string | undefined => {
  return value ? sanitizeText(value) : undefined;
};

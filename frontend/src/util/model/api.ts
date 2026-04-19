const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const PORT_PATTERN = /^\d+$/;

const getBrowserOrigin = () => {
  if (typeof window === "undefined") {
    return "http://localhost";
  }

  return window.location.origin;
};

const resolveServiceUrl = (value: string | undefined) => {
  const normalizedValue = value?.trim().replace(/\/+$/, "");

  if (!normalizedValue) {
    return getBrowserOrigin();
  }

  if (ABSOLUTE_URL_PATTERN.test(normalizedValue)) {
    return normalizedValue;
  }

  if (PORT_PATTERN.test(normalizedValue)) {
    const url = new URL(getBrowserOrigin());
    url.port = normalizedValue;
    return url.origin;
  }

  return normalizedValue;
};

export const port = resolveServiceUrl(import.meta.env.DF_PORT);
export const authPort = resolveServiceUrl(import.meta.env.AUTH_PORT);

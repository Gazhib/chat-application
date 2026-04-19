const getRequiredUrl = (value: string | undefined, envName: string) => {
  const normalizedValue = value?.trim().replace(/\/+$/, "");

  if (!normalizedValue) {
    throw new Error(`${envName} is not set. Add it to the root .env file.`);
  }

  return normalizedValue;
};

export const apiUrl = getRequiredUrl(
  import.meta.env.VITE_API_URL,
  "VITE_API_URL"
);
export const authUrl = getRequiredUrl(
  import.meta.env.VITE_AUTH_URL,
  "VITE_AUTH_URL"
);

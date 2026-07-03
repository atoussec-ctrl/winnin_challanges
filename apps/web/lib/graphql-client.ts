interface GraphQLResponse<T> {
  readonly data?: T;
  readonly errors?: readonly { readonly message: string }[];
}

export interface PostGraphqlOptions {
  readonly endpoint: string;
  readonly label: string;
  readonly query: string;
  readonly variables?: Record<string, unknown>;
}

export async function postGraphql<T>(options: PostGraphqlOptions): Promise<T> {
  const response = await fetch(options.endpoint, {
    body: JSON.stringify({ query: options.query, variables: options.variables }),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`${options.label} request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as GraphQLResponse<T>;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  if (payload.data === undefined) {
    throw new Error(`${options.label} returned an empty response.`);
  }

  return payload.data;
}

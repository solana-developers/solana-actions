import { ActionPostResponse } from "@solana/actions";

export async function fetchBlink(
  blink: string | URL,
  account: string,
): Promise<ActionPostResponse> {
  const txResponse = await fetch(blink, {
    method: "POST",
    body: JSON.stringify({ account: account }),
  });

  const txResponseBody: ActionPostResponse = await txResponse.json();
  return txResponseBody;
}

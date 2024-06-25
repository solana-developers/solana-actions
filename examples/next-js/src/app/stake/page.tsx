"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SolanaQRCode } from "@/components/qr-code";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { useEffect, useState } from "react";
import { DEFAULT_VALIDATOR_VOTE_PUBKEY } from "../api/actions/stake/const";

export default function Pages() {
  const apiPath = "/api/actions/stake";
  const [apiEndpoint, setApiEndpoint] = useState("");

  // todo: allow the user to update this via the UI
  const validator = DEFAULT_VALIDATOR_VOTE_PUBKEY.toBase58();

  useEffect(() => {
    setApiEndpoint(
      new URL(apiPath, window.location.href).toString() +
        `?validator=${validator}`,
    );

    return () => {
      setApiEndpoint(new URL(apiPath, window.location.href).toString());
    };
  }, [validator]);

  return (
    <section
      id="action"
      className={
        "container space-y-12 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
      }
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-6 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Staking SOL
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          The following example demonstrates how to stake SOL to the Solana
          network using an Action.
        </p>
      </div>

      <Card className="group-hover:border-primary size-[400px] rounded overflow-hidden text-center flex items-center justify-center w-min mx-auto">
        <SolanaQRCode
          url={`${apiPath}?validator=${validator}`}
          color="white"
          background="black"
          size={400}
          className="rounded-lg overflow-clip min-w-[400px]"
        />
      </Card>

      <div className="mx-auto text-center md:max-w-[58rem]">
        <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          View the{" "}
          <Button variant={"link"} asChild>
            <Link
              href={`${siteConfig.links.github}/src/app${apiPath}/route.ts`}
              target="_blank"
            >
              source code for this sample Action
            </Link>
          </Button>{" "}
          on GitHub.
        </p>
      </div>

      <Card className="group-hover:border-primary">
        <CardHeader>
          <CardTitle className="space-y-3">Action Endpoint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground">
            <Link
              href={apiEndpoint}
              target="_blank"
              className="underline hover:text-primary"
            >
              {apiEndpoint}
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

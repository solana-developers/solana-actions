[![Deploy with Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/solana-developers/solana-actions/examples/cloudflare-workers)

## Setup

To create a new project using this template, run:

```sh
$ npm create cloudflare@latest -- --template https://github.com/solana-developers/solana-actions/examples/cloudflare-workers
```

## Dev

To test your project, run:

```sh
npm run dev
```

And then open Dialect interstitial website: https://dial.to/?action=solana-action:http://localhost:8787. It'll use your local web server, so you can develop and test almost in realtime.

## Deploy

You can use cloudflare workers to deploy, it's free and has a generous free tier:

```sh
npm run deploy
```

Read more: https://developers.cloudflare.com/workers/
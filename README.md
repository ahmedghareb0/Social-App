# Social App

A React + TypeScript social media frontend powered by the Route Academy Posts API.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build` and run ESLint with `npm run lint`.

## API integration

The API client is centralized in `src/api/client.ts` and uses
`https://route-posts.routemisr.com`. It stores the returned JWT in browser
`localStorage`, sends it as a Bearer token, and clears the session on HTTP 401.

The API and Postman documentation list request methods and inputs, but do not
include endpoint-specific response schemas. The UI therefore reads the
documented response envelope and inspects returned data rather than using local
sample records.

Unauthenticated read-only checks of `GET /posts` and `GET /posts/feed` returned
HTTP 401, so live response structures could not be verified without an
authorized account. No account was created and no credentials were used for
testing.

The published Postman requests for `GET /posts/` (“Get Single Post”) and
`DELETE /posts/` (“Delete Post”) have no post ID in their paths, and the API
index does not confirm ID-bearing paths for either operation. Post Details
therefore uses the documented `GET /posts` listing to find the requested post
by its returned ID, with navigation state as an immediate display fallback.
If the listing omits that post or its identifier, direct retrieval remains
unavailable; post deletion remains disabled until its exact endpoint is
confirmed.

The API documentation also does not specify image-removal semantics for post
or comment updates. Editing supports text changes and image replacement, but
does not claim to remove an existing image.

## Cloudflare Workers View Counter & Realtime Chat

```shell
npm i -g wrangler

wrangler init workers-visitors
cd workers-visitors

# production
wrangler kv:namespace create 'view_counter'

# development
wrangler kv:namespace create --preview 'view_counter'

# start dev server to put kv db
wrangler dev --remote
```

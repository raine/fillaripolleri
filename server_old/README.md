## running `./scripts/process-topics.js` against prod db

```sh
kubectl port-forward postgres-0 5432:5433
export DATABASE_URL='postgres://postgres:PASSWORD@localhost:5432/fillaritori'
node -r esm scripts/process-topics.js --where='t.guid > 139460'
```

## running process topics on production

1. update where condition in latest_topics.sql to match necessary time span
2. deploy
3. connect to prod db with psql
4. update latest topic: `update job set finished_at = finished_at where id = ID;`
5. server should then run process topics

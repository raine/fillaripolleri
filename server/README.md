## running `./scripts/process-topics.js` against prod db

```sh
kubectl port-forward postgres-0 5432:5433
export DATABASE_URL='postgres://postgres:PASSWORD@localhost:5432/fillaritori'
node -r esm scripts/process-topics.js --where='t.guid > 139460'
```

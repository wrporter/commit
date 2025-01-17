# Commit

1. Update database with
   ```shell
   DATABASE_URL=postgresql://postgres:postgres@192.168.1.222:5412/commit npm run db:update
   ```
2. Build
   ```shell
   SCOPE=main .ci/build.sh
   ```
3. Deploy
   ```shell
   SCOPE=main .ci/deploy.sh
   ```

## Known Issues

After upgrading to React Router v7, there is an issue with forms on the page.

- https://github.com/airjp73/rvf/issues/410
- https://github.com/remix-run/react-router/issues/12475

Downgrading to Node v20 resolves this for now.

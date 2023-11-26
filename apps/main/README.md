# Commit

1. Update database with
    ```shell
    DATABASE_URL=postgresql://postgres:postgres@192.168.1.222:5412/commit?authSource=admin&directConnection=true npm run db:update
    ```
2. Build
    ```shell
    SCOPE=main .ci/build.sh
    ```
3. Deploy
    ```shell
    SCOPE=main .ci/deploy.sh
    ```

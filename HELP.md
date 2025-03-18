# Infrastructure:

   Follow one of the options below.

```
- docker compose up
- use your internal db <MySQL> and Modify the .env variables according to your local database settings. 
```

# DB Migration:

    * for up:

```
yarn run migrate:up
```

    * for down:

```
yarn run migrate:down
```

# Run Test

```
yarn run test
```

# Run App

```
yarn run start
```



### Optional:

    You can use the following command to send a request to the program:

```
curl --location 'localhost:3000/generate' \
--header 'Content-Type: application/json' \
--data '{
    "items": [2,6,3,9,7,4],
    "length": 4
}'
```

# Self Service Portal

This is the frontend part of the self-service platform.

## How to run

1. Begin by renaming `src/.env.local` to `src/.env`.

We recommend using the provided **Makefile** targets, though if you're an npm ninja then you do you.<br>

This react app depends on having an API running behind it. The UI will in theory run fine without one, but you'll see error banners and errors in your console if you do so. This will make it generally less pleasant to use, expecially if you want to debug changes you're working on.<br>

### Method 1: the fake api (Deprecated-ish)

This project comes with a "fake" api (also a react app) which produces responses based on spoofing the content of a databse with the data specified in `fake_dependencies/selfservice-api/src/data.ts`.
To sping this fake dependency up, simply run

```bash
docker compose up --build
```

Then to start the react app run

```bash
make dev
```

:warning: **The fake api is no longer maintained, and does not match the behavior of the one in production**

we are in the process of fixing this.

### Method 2: local instance of the real api

This is the method we prefer. Start a local instance of the [self-service api](https://github.com/dfds/selfservice-api/tree/develop). The default port it starts on is `8080`.<br>
In the file `src/.env`, add/change the following line

```bash
REACT_APP_API_BASE_URL=http://localhost:<port_where_the_api_is_exposed_on>
```

Then, to start the app run

```bash
make dev
```

if you want to check whether your project has any JavaScript/TypeScript warnings, you can also run `make build` instead.

## Workflow and formatting

- we use prettier for formatting
- This project uses a lighter version of the classic git master/develop/feature/hotfix workflow. We try to have a 1-1 mapping of features (= feature branches) to issues on [this board](https://github.com/orgs/dfds/projects/25/views/5?filterQuery=milestone%3A%221P%3A+Self-Service+Platform+resuscitation+%2B+Kafka-Janitor+rework%22), and try to keep feature branches as limited in scope as possible. We make PRs into `develop` and have automatic mergeing from develop into `master` every once in a while.

# Self Service Portal

## Getting started
When you have a freshly cloned repository, navigate to the root of it in your `bash` terminal and run the following command:

```bash
make
```

After that succeeds you can spin up dependencies by running `docker compose` at the root of your repository:

```bash
docker-compose up --build
```

You are now ready to spin up a local development server to browse the site and write some code. Do that by running the following command at the 
root of your repository:

```bash
make dev
```

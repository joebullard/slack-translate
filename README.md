# Slack Translate Bot

This part of the repo provides and implementation of a Slackbot which can
perform either one-to-one translation (e.g. Japanese <-> English), or
many-to-one translation (e.g. __anything__ -> English).

The target language of the bot (along with some other variables) is set in the
environment, rather than the code or a static file, to make it easier to deploy
multiple bots with different languages.


## Screenshots

Example of a many-to-one translation bot for English:

![Many-to-one Screenshot](https://raw.githubusercontent.com/joebullard/slack-translate/master/images/many2one.png)

Example of a bilingual one-to-one translation bot for Japanese and English:

![One-to-one Screenshot](https://raw.githubusercontent.com/joebullard/slack-translate/master/images/one2one.png)


## Setup and Configuration

### Create the Slack bot user

First, create a bot user for your team and configure the name, description,
photo, etc as you wish.
See the [Slack Bot Documentation](https://api.slack.com/bot-users) if you do
not know how to do this.
You will need the token on this page to run your bot.


### `env` variables

The bot depends on a few environment variables:

+ `BOT_TOKEN`: *(required)* Slack bot token obtained when creating the bot user
+ `TARGET_LANG`: *(required)* official 2-letter code for the target language
+ `SOURCE_LANG`: (optional) official 2-letter code for the source language.
  Defining this variable will result in a one-to-one translation bot, not
  defining it will result in a many-to-one translation bot.
+ `GOOGLE_CREDENTIALS`: (optional) path to GCP credentials JSON file (e.g.
  service account). If deploying in Google Cloud, you don't need to supply
  this unless you have specific requirements for it. When running locally,
  failing to supply this mean you are using the public-facing Translate API and
  will be cut off after a small number of requests.
+ `GREETING`: (optional) greeting message to display when the bot joins a
  channel
+ `APOLOGY`: (optional) apology message to display when the bot encounters an
  error
+ `ILLITERATE`: (optional) message to display when a one-to-one bot is asked to
  translate a language it does not speak

Save these values in typical bash syntax inside of a file
(see `.sample-env.one2one` and `.sample-env.many2one` in this repo).


### Node

The `env` values we defined are obtained through the `dotenv` package when
running directly in `node`:

```
node -r dotenv/config index.js dotenv_config_path=my-env-file
```

### Docker

You don't have to run the bot in Docker, but there are some nice benefits of
doing so.

You can build the Docker image in the root of this repo like this:

```
docker build -t slack-translate-bot .
```

It is best practice to never include sensitive data like credentials or API
keys inside of a Docker image.
The `.dockerignore` supplied in this repo will ignore a `credentials/`
directory, which is where you can place your Google service account JSON.
Since the `env` file you created specifies a path to a credentials JSON,
you must mount the  directory as a volume in your Docker container, so it can
be found at runtime (that means you may need to alter your `GOOGLE_CREDENTIALS`
variable to match your desired path inside the container);

e.g.:
```
docker run -d \
    --name bot-en
    --env-file my-env-file
    -v $(pwd)/credentials/:/credentials
    slack-translate-bot
```

Assuming I set `GOOGLE_CREDENTIALS=/credentials/credentials.json` and I have a
file `./credentials/credentials.json`, then the container ran in the command
above should have no trouble.


### Deploy in Google Cloud

Note that if you are reploying this in Google Container Engine (GKE), then
you don't even need to specify or provide credentials at all, as the defaults
will automatically be used.

If you still want to use a specific service account, then you should probably
supply it as a Kubernetes secret.

**TODO**: add instructions for GKE deployment

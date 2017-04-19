# Slack Translate Bot

This part of the repo provides and implementation of a many-to-one translation
bot (i.e. it can translate any language supported by Google Translate into one
language specified for the bot).

The target language of the bot (along with some other variables) is set in the
environment, rather than the code or a static file, to make it easier to deploy
multiple bots with different languages.


## Usage

My setup has two bots: one for English and one for Japanese:

![Japanese Bot Screenshot](https://raw.githubusercontent.com/joebullard/slack-translate/master/images/bot-ja.png)
![English Bot Screenshot](https://raw.githubusercontent.com/joebullard/slack-translate/master/images/bot-en.png)


## Setup and Configuration

### Create the Slack bot user

First, create a bot user for your team and configure the name, description,
photo, etc as you wish.
See the [Slack Bot Documentation](https://api.slack.com/bot-users) if you do
not know how to do this.
You will need the token on this page to run your bot.


### `env` variables

The bot depends on a few environment variables (see `.sample-env`):

+ `BOT_TOKEN`: *(required)* Slack bot token obtained when creating the bot user
+ `TARGET_LANG`: *(required)* official 2-letter code for the target language
+ `GOOGLE_CREDENTIALS`: (optional) path to GCP credentials JSON file (e.g. service account)
+ `GREETING`: (optional) greeting message to display when the bot joins a channel
+ `APOLOGY`: (optional) apology message to display when the bot encounters an error

These values are obtained through the `dotenv` package when running directly in
`node`:

```
node -r dotenv/config translate-bot.js dotenv_config_path=my-env-file
```

### Docker

You don't have to run the bot in Docker, but there are some nice benefits of
doing so. 

You can build the Docker image of the bot like this:

```
docker build -t joebullard/slack-translate-bot .
```

Supply environment variables by setting the `-env-file` flag when running in
Docker:

```
docker run -d --env-file my-env-file joebullard/slack-translate-bot
```

For example, my team's primary languages are English and Japanese, so I have
two `.env.english` and `.env.japanese`, and I simply run a Docker container for
each.

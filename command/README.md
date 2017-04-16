# Slack Translate Command

For now, this repo provides Google Cloud Functions which can be deployed and
configured as Slack slash-commands for translation of messages.

The current architecture requires the language to be sent as
a query param. This means that you need one Slack command (and its API key) for
every desired target language, instead of having one command which treats the
first word as a parameter for example.

I will not be changing this anytime soon, as my team only cares about
English/Japanese translation, and it is more user-friendly to have two commands
which operate in opposite directions (see images below).


## Usage

My setup has English and Japanese:

![Usage Screenshot](https://raw.githubusercontent.com/joebullard/slack-translate-command/master/images/usage.png)

This is the displayed (private) output:

![Command Output Screenshot](https://raw.githubusercontent.com/joebullard/slack-translate-command/master/images/output.png)


## Setup

### Create the Slack Command

First, create a Slack slash-command integration for your team. See this
[link](https://api.slack.com/slash-commands) if you do not know how to do that.

You can leave the URL blank for now, as you have not deployed the Cloud
Function yet anyway.

You will need to fill in the `SLACK_TOKEN` variables in a `config.json` (see
example in `config.json.example`).

**Currently this is done per language, see note at top of this README)**.


### Deploy the Cloud Function

This assumes you are familiar with Google Cloud Platform (GCP) in general.
You will need a Google Cloud project with the Cloud Functions (beta) API
enabled.

First create your staging bucket in Google Cloud Storage:
```
gsutil mb -l us-central1 my-unique-staging-bucket-name
```

The you can simply deploy the `translate` function with an http trigger:

```
gcloud beta functions deploy translate \
    --stage-bucket my-unique-staging-bucket-name \
    --trigger-http \
    --region us-central1 \
    --project my-project-id
```

The endpoint for your function is now:

```
https://us-central1-my-project-id.cloudfunctions.net/translate
```

Copy this URL into your Slack slash command configuration page, with an added
query parameter for your target language code.
For example, if you wanted to translate into Japanese, use 'ja':

```
https://us-central1-my-project-id.cloudfunctions.net/translate?lang=ja
```

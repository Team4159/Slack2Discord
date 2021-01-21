# Slack2Discord

Copies Slack messages from Slack to Discord, support for images and files. Supports mutiple channels, and it will create a respective channel for each channel in Slack. This does not copy previous messages, and will only copy over new messages that are sent.

## How to run
Git clone this repository, and run `npm install`. Create a Slack bot, and enable the events api. You will need to port forward port 3000 and set your hosting ip as the event api destination. Create a Discord bot, and add it to the server you wish to copy messages to. 

Either `export` the following enviornment variables in a linux system:

```
DISCORD_TOKEN (token for your discord bot)
SLACK_SIGNING_SECRET (signing secret for your slack bot)
SLACK_TOKEN (token for your slack bot)
```

Or edit the `slacktodiscord.js` file and replace each `process.env.TOKEN` with your respective token. 

Set the `serverId` to your discord server's id, and create a category. Set `categoryId` to the id of the category you just created. New channels will be put under this category, but you can move them around after. 

Run with `node slacktodiscord.js`. 

# Slack2Discord
Copies messages from Slack to a Discord server. Supports multiple channels and will create new channels on demand. Files and Images are also supported<br>
##### Note: Messages will only be copied in real time. Any messages that are missed while the program is down will not be sent after restarting.

## How to Run
There are two versions of the bridge in this repository. Legacy is the original script while the Slack-to-Discord-Bridge submodule is the new project.<br>

### Running Legacy
To run the Legacy project, first install all the necessary dependencies by entering the folder and running `npm install`.<br>
Create a Slack Bot on the Slack APIs page and enable the Events API for it. Remember to port forward port 3000 and set the hosting IP as the Event API Destination.<br>
Next create a Discord Bot in the Discord Developers Portal and add the bot to the server you wish to copy messages to. Remember to give it permissions to Manage Channels and Send Messages and Files.

Next, either `export` or the following environment variables in a Linux terminal or edit the `slacktodiscord.js` file, replacing each `process.env.TOKEN` with their respective tokens/credentials.
```
DISCORD_TOKEN (The token for your Discord bot)
SLACK_SIGNING_SECRET (The signing secret for your slack bot)
SLACK_TOKEN (The token for your Slack bot)
```

Next, in `slacktodiscord.js`, set the `serverId` to your Discord server's id and create a category to set the `categoryId` to.<br>
Finally, run the project with `node slacktodiscord.js`

### Running Slack-to-Discord-Bridge (New)
To run the new project, it will first need to be installed.<br>
Run the commands `git submodule init` then `git submodule update` before entering the `Slack-to-Discord-Bridge` folder.<br>
After installing the project to the folder, you will be able to see a new `README.md` inside it. Read the set-up instructions on the file to complete the set-up process.

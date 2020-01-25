//get tokens from enviornment variables
const DISCORD_TOKEN         = process.env.DISCORD_TOKEN;
const slackSigningSecret    = process.env.SLACK_SIGNING_SECRET;
const token                 = process.env.SLACK_TOKEN; 
const bottoken              = process.env.BOT_TOKEN;

//deps
const Discord = require('discord.js');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');
const web = new WebClient(token);
const fs = require('fs');
const fileExtension = require('file-extension');
const del = require('del');
const discord_client = new Discord.Client();
const slackEvents = createEventAdapter(slackSigningSecret);
const port = process.env.PORT || 3000;
const request = require('request');

var discord_channel;

discord_client.login(DISCORD_TOKEN);

(async () => {
  const server = await slackEvents.start(port);
  console.log(`Listening for events on ${server.address().port}`);
})();

slackEvents.on('message',  (async function(message) {
        if (message.type == "message")
        {
			//get info
			var name = (await getUser(message.user)).user.real_name;
			var channel = (await getChannel(message.channel)).channel.name;
			var pfp = (await getUser(message.user)).user.profile.image_72;
			
			//connect to channel
			var param = channel !== "" ? "name" : "id";
			var value = channel;
			var potential_channels = discord_client.channels.findAll(param, value);
			if (potential_channels.length === 0) {
				console.log("Error: No Discord channels with " + param + " " + value + " found.");
				var server = discord_client.guilds.get('670486240918765585');
				await server.createChannel(channel, "text");
				var newChannel = await discord_client.channels.findAll("name", channel)[0];
				newChannel.setParent('670713927465697283');
				discord_channel = newChannel;
				console.log("Created channel " + channel);
			} else {
				discord_channel = potential_channels[0];
			}
			if (potential_channels.length > 1) {
				console.log("Warning: More than 1 Discord channel with " + param + " " + value + " found.");
				console.log("Defaulting to first one found");
			}
			console.log("Connected to channel " + channel);
	
			//send message
			var textEmbed = new Discord.RichEmbed()
				.setAuthor(name, pfp)
				.setDescription(message.text);
			discord_channel.send(textEmbed);
			
			//handle files and images
			if("files" in message){
				for(i = 0; i < message.files.length; i++){
					var fileext = fileExtension([message.files[i].name])
					//Get file
					const options = {
						url: message.files[i].url_private,
						method: "GET",
						headers: {
							"Authorization": "Bearer " + token,
						}
					};
					await new Promise(resolve =>
						request(options)
							.pipe(fs.createWriteStream(message.files[i].name))
							.on('finish', resolve));
							
					//inline images
					if(fileext == "png" || fileext == "jpg"){
						const file = new Discord.Attachment(message.files[i].name);
						const imageEmbed = {
							title: message.files[i].name,
							image: {
								url: 'attachment://' + message.files[i].name,
							},
						};

						await discord_channel.send({ files: [file], embed: imageEmbed });
					} else
						await discord_channel.send({files: [message.files[i].name]});
					//delete file
					await del([message.files[i].name]);
				}
				console.log("uploaded " + message.files.length + " files");
			}
        }
}));

async function getUser(id){
	const thing = await web.users.info({
		user: id,
	});
	return thing;
}

async function getChannel(id){
	const thing = await web.conversations.info({
		channel: id,
	});
	return thing;
}

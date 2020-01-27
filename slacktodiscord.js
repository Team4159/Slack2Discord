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
			var name = await getName(message.user);
			var pfp;
			await (getUser(message.user)).then((pfpling) => {
				pfp = pfpling.user.profile.image_72;
			}).catch((error) => {
				pfp = 'https://i.postimg.cc/CKk5xpVY/image.png';
			});

			//connect to channel
			var channel = (await getChannel(message.channel)).channel.name;
			var param = "name"
			var potential_channels = discord_client.channels.filter(test2 => test2.name == channel).filter(test3 => test3.type == 'text');
			console.log("Found " + potential_channels.size + " channels with name " + channel);
			if (potential_channels.size === 0) {
				console.log("Error: No Discord channels with " + param + " " + channel + " found.");
				var server = await discord_client.guilds.get('670486240918765585');
				await server.createChannel(channel, "text");
				var newChannel = await discord_client.channels.filter(test2 => test2.name == channel).filter(test3 => test3.type == 'text').get(discord_client.channels.filter(test2 => test2.name == channel).filter(test3 => test3.type == 'text').keys().next().value);
				await newChannel.setParent('670713927465697283');
				discord_channel = newChannel;
				console.log("Created channel " + channel);
			} else {
				discord_channel = await potential_channels.get(discord_client.channels.filter(test2 => test2.name == channel).filter(test3 => test3.type == 'text').keys().next().value);
			}
			if (potential_channels.size > 1) {
				console.log("Warning: More than 1 Discord channel with " + param + " " + channel + " found.");
				console.log("Defaulting to first one found");
			}
			console.log("Connected to channel " + discord_channel.name + ' (' + discord_channel.id + ')');
			//length of the mention string including special characters
			const mentionLength = 12;
			for(var t = 0; t < message.text.length - 12; t++){
				var messagetest = "";
				var lastmention = 0;
				if(t + 12 <= message.text.length && message.text.substring(t, t + 2) == "<@" && message.text.substring(t + 11, t + 12) == ">"){
					messagetest += (message.text.substring(lastmention, t) + "@" + "name here"); 
					lastmention = t;
					console.log(message.text.substring(t + 2, t + 11));
				}
				console.log(messagetest);

			}
			//send message
			var textEmbed = new Discord.RichEmbed()
				.setAuthor(name, pfp)
				.setDescription(messagetest);
			try {
				await discord_channel.send(textEmbed);
			}
			catch (error) {
				console.log(error);
				console.log(discord_channel);
				console.log(typeof discord_channel.send);
			}
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

					if(fileext == "mp4" || fileext == "mov")
					{
						var linkEmbed = new Discord.RichEmbed()
							.setAuthor(name, pfp)
							.setTitle(message.files[i].name)
							.setURL(message.files[i].url_private);
						await discord_channel.send(linkEmbed);
					} else {
						await new Promise(resolve =>
							request(options)
								.pipe(fs.createWriteStream('./files/' + message.files[i].name))
								.on('finish', resolve));

						//inline images
						if(fileext == "png" || fileext == "jpg"){
							const file = new Discord.Attachment('./files/' + message.files[i].name);
							const imageEmbed = {
								title: message.files[i].name,
								image: {
									url: 'attachment://' + './files/' + message.files[i].name,
								},
							};
							await discord_channel.send({ files: [file], embed: imageEmbed });
						} else {
							try {
								await discord_channel.send({files: ['./files/' + message.files[i].name]});
							}
							catch(error) {
								var linkEmbed = new Discord.RichEmbed()
									.setAuthor(name, pfp)
									.setTitle(message.files[i].name)
									.setURL(message.files[i].url_private);
								await discord_channel.send(linkEmbed);
								console.error(error);
							}
						}

					//delete file
					await del('./files/' + [message.files[i].name]);
					}
				}
				console.log("uploaded " + message.files.length + " files");
			}

		}
}));

async function getName(id){
	await (getUser(id)).then((nameling) => {
		return nameling.user.real_name;
	}).catch((error) => {
		return nameling.user.name;
	}).catch((error) => {
		return "Deleted User";
	})
}

async function getUser(id){
	const ling = await web.users.info({
		user: id,
	});
	return ling;
}

async function getChannel(id){
	const ling = await web.conversations.info({
		channel: id,
	});
	return ling;
}

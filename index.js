const { Client, Events, EmbedBuilder, GatewayIntentBits } = require('discord.js');

const config = require('./config.json');

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates
	],
    restTimeOffset: 0,
    restSweepInterval: 60,
    partials: ['MESSAGE', 'CHANNEL', 'GUILD_MEMBER', 'USER']
});

client.once(Events.ClientReady, botClient => {
	console.log(`Ready! Logged in as ${botClient.user.tag}`);
});

async function updateCFXStatus() {
	const guild = client.guilds.cache.get(config.guildID);
	if (guild) {
		const channel = guild.channels.cache.get(config.channelID);
		if (channel) {
			const response = await fetch("https://status.cfx.re/api/v2/status.json");
			let responseJson = await response.json();

			const componentsResponse = await fetch("https://status.cfx.re/api/v2/components.json");
			let componentsResponseJson = await componentsResponse.json();

			let color = 0x00FF00;

			if (responseJson.status.indicator == "minor") {
				color = 0xf5d742;
			} else if (responseJson.status.indicator == "major") {
				color = 0xfc7f19;
			} else if (responseJson.status.indicator == "critical") {
				color = 0xfc1d19;
			}

			let description = "";
			for (key in componentsResponseJson.components) {
				if (componentsResponseJson.components[key].status == "operational") {
					description = description + ":green_circle: " + componentsResponseJson.components[key].name + "\n";
				} else if (componentsResponseJson.components[key].status == "degraded_performance") {
					description = description + ":yellow_circle: " + componentsResponseJson.components[key].name + "\n";
				} else if (componentsResponseJson.components[key].status == "partial_outage") {
					description = description + ":orange_circle: " + componentsResponseJson.components[key].name + "\n";
				} else if (componentsResponseJson.components[key].status == "major_outage") {
					description = description + ":red_circle: " + componentsResponseJson.components[key].name + "\n";
				}
			}

			const embed = new EmbedBuilder()
				.setAuthor({ name: 'Cfx.re Systemstatus', iconURL: "https://avatars.githubusercontent.com/u/25160833?s=280&v=4" })
				.setTitle(responseJson.status.description)
				.setDescription(description)
				.setColor(color)
				.setTimestamp()
				.setFooter({ text: `Cfx.re Systemstatus | ${new Date().getFullYear()}`, iconURL: "https://avatars.githubusercontent.com/u/25160833?s=280&v=4" });

			channel.messages.fetch({ limit: 10 }).then(messages => {
				let prevEmbed;
				messages.forEach(message => {
					if (message.embeds.length > 0 && message.embeds[0].author && message.embeds[0].author.name === 'Cfx.re Systemstatus') {
						prevEmbed = message;
					}
				});
			
				if (prevEmbed) {
					prevEmbed.edit({ embeds: [embed] });
				} else {
					channel.send({ embeds: [embed] });
				}
			});
		}
	}
}

setInterval(updateCFXStatus, 5 * 60000);
setTimeout(updateCFXStatus, 1000);

client.login(config.token);
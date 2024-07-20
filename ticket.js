const { Client, Events, GatewayIntentBits } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { ChannelType, ThreadAutoArchiveDuration } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { REST, Collection, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require("crypto");
const Keyv = require('keyv')
const tickets = new Keyv('sqlite://ticket.sqlite', { table: 'tickets' })
const boosts = new Keyv('sqlite://ticket.sqlite', { table: 'boosts' })
const system = new Keyv('sqlite://ticket.sqlite', { table: 'system' })
const config = new Keyv('sqlite://ticket.sqlite', { table: 'config' })

tickets.on('error', err => console.error('Keyv connection error:', err))
boosts.on('error', err => console.error('Keyv connection error:', err))
system.on('error', err => console.error('Keyv connection error:', err))
config.on('error', err => console.error('Keyv connection error:', err))

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent
	],
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isButton) return;

	if (interaction.customId === 'open-ticket') {
		const ticketdata = await tickets.get(interaction.user.id);
		if (ticketdata !== undefined) {
			if (ticketdata.activethread === true) {
				const exampleEmbed2 = new EmbedBuilder()
					.setColor("#c6d8a9")
					.setTitle('Failed')
					.setDescription('You have already created a ticket.\nYou can create a new ticket by closing the ticket <#' + ticketdata.ticketid + '>')

				await interaction.reply({
					embeds: [exampleEmbed2], ephemeral: true
				});
				return;
			}
		}

		const uuid = crypto.randomUUID().substring(0, 7)

		const thread = await interaction.channel.threads.create({
			name: 'ticket-' + uuid,
			autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
			type: ChannelType.PrivateThread,
			reason: 'Created by Ticket System',
		});
		const config2 = await config.get("system")
		console.log(thread.id)
		console.log(thread)
		await thread.members.add(interaction.user.id);
		await tickets.set(interaction.user.id, { ticketid: thread.id, activethread: true })
		await system.set(thread.id, { uuid: uuid, user: interaction.user.id })
		const exampleEmbed = new EmbedBuilder()
			.setColor("#c6d8a9")
			.setTitle('Ticket Created')
			.setDescription('1. Please enter your question first.')
		await thread.send({ embeds: [exampleEmbed], content: "<@&" + config2.role + ">" })
		
		const exampleEmbed2 = new EmbedBuilder()
			.setColor("#c6d8a9")
			.setTitle('Ticket Created')
			.setDescription('<#' + thread.id + ">")
		await interaction.reply({
			embeds: [exampleEmbed2], ephemeral: true
		});
	}
});



const commands = [];
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {

	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction, tickets, boosts, system, config);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.login(token);

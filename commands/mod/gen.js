const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('generate')
		.setDescription('action')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('action name')),
	async execute(interaction, tickets, boosts, system, config) {
		const config2 = await config.get("system")
		if ( interaction.member.roles.cache.some(role => role.id === config2.role)) {
			
		} else {
			await interaction.reply({ content: 'you dont have permission', ephemeral: true });
			return;
		}


		const name = interaction.options.getString('name');
		if (name === "ticket") {

			const question = new ButtonBuilder()
				.setCustomId('open-ticket')
				.setLabel('Create Ticket')
				.setStyle(ButtonStyle.Primary);

			const row = new ActionRowBuilder()
				.addComponents(question);

			const exampleEmbed = new EmbedBuilder()
				.setColor("#c6d8a9")
				.setTitle('Create Ticket')
				.setDescription('If you have questions, please create a ticket.')

			await interaction.channel.send({
				embeds: [exampleEmbed],
				components: [row],
			});
			await interaction.reply({ content: 'ok', ephemeral: true });
		} else {
			await interaction.reply("no action command");
		}

	},
};
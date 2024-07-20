const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset-user')
		.setDescription('reset user database')
		.addUserOption(option =>
			option.setName('user')
				.setRequired(true)
				.setDescription('user')),
	async execute(interaction, tickets, boosts, system, config) {
		const config2 = await config.get("system")
		if ( interaction.member.roles.cache.some(role => role.id === config2.role)) {
			
		} else {
			await interaction.reply({ content: 'you dont have permission', ephemeral: true });
			return;
		}

		await tickets.set(interaction.options.getUser("user").id, { ticketid: "unset", activethread: false })
		console.log()
		const exampleEmbed = new EmbedBuilder()
			.setColor("#c6d8a9")
			.setTitle('Completed')
			.setDescription(':white_check_mark: Ticket information has been cleared.')

		await interaction.reply({
			embeds: [exampleEmbed],
		});
	},
};
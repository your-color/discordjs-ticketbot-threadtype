const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('close')
		.setDescription('close ticket'),
	async execute(interaction, tickets, boosts, system, config) {
		const config2 = await config.get("system")
		const channel = interaction.guild.channels.cache.get(config2.channel) // ticket channel
		const thread = channel.threads.cache.find(x => x.id === interaction.channelId);
		await console.log(interaction.channelId)
		const userid = await system.get(interaction.channelId);
		await console.log("user:" + userid.user)
		await tickets.set(userid.user, { ticketid: interaction.channelId, activethread: false })
		console.log()
		const exampleEmbed = new EmbedBuilder()
			.setColor("#c6d8a9")
			.setTitle('Resolved')
			.setDescription(':white_check_mark: Ticket marked as resolved by <@' + interaction.user.id + '>\nIf you wish to ask the question again, please create a new ticket.')

		await interaction.reply({
			embeds: [exampleEmbed],
		});
		await thread.setLocked(true);
		await thread.setArchived(true);
	},
};
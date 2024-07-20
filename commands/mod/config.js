const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('config')
		.setDescription('set ticket config')
		.addChannelOption(option =>
			option.setName('channel')
				.setRequired(true)
				.setDescription('user'))
		.addRoleOption(option =>
					option.setName('role')
						.setRequired(true)
						.setDescription('role')),
	async execute(interaction, tickets, boosts, system, config) {
		console.log("ok")
		const config2 = await config.get("system")
		console.log(interaction.guild.ownerId)
		
		if ( interaction.member.roles.cache.some(role => role.id === config2.role)) {
			console.log("bypass")
		} else if ( interaction.user.id === interaction.guild.ownerId ) {
			console.log("bypass")
		} else {
			await interaction.reply({ content: 'you dont have permission', ephemeral: true });
			return;
		}

		await config.set("system", { channel: interaction.options.getChannel("channel").id, role: interaction.options.getRole("role").id})
		const exampleEmbed = new EmbedBuilder()
			.setColor("#c6d8a9")
			.setTitle('Completed')
			.setDescription(':white_check_mark: config writed')

		await interaction.reply({
			embeds: [exampleEmbed],
		});
	},
};
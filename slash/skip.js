const { SlashCommandBuilder } = require("@discordjs//builders")
const { MessageEmbed, Message } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skips the current song."),

    run: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId)
        if (!queue)
            return await interaction.editReply("There are no songs in the queue!")

        const currentSong = queue.current

        queue.skip()
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`Skipped **${currentSong.title}** by **${currentSong.author}**`).setThumbnail(currentSong.thumbnail)
            ]
        })
    },
}

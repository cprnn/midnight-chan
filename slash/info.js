const { SlashCommandBuilder } = require("@discordjs//builders")
const { MessageEmbed} = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Displays info about the currently playing song"),

    run: async ({ client, interaction }) => {
        const queue = client.player.getQueue(interaction.guildId)
        if (!queue) 
            return await interaction.editReply("There are no songs in the queue!")

        let bar = queue.createProgressBar({
            queue: false,
            lenght: 19
        })

        const song = queue.current

        await interaction.editReply({
            embeds: [new MessageEmbed()
            .setThumbnail(song.thumbnail)
            .setDescription(`Currently playing: [${song.title}](${song.url})\n\n[${currentSong.duration}]`+ bar +`\n\n_**Requested by:** <@${song.requestedBy.id}>_`)	
        ],
        })
    },
}

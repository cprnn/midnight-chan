const { SlashCommandBuilder } = require("@discordjs//builders")
const { MessageEmbed } = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song from YouTube")
        .addSubcommand((subcommand) =>
            subcommand.setName("song")
                .setDescription("Play a single song from a url")
                .addStringOption((option) => option.setName("url").setDescription("The url of the song to play").setRequired(true))
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("playlist")
                .setDescription("Play a playlist from a url")
                .addStringOption((option) => option.setName("url").setDescription("The url of the playlist to play").setRequired(true))
        )
        .addSubcommand((subcommand) =>
            subcommand.setName("search")
                .setDescription("Searches for a song based on the query and plays it")
                .addStringOption((option) => option.setName("searchtems").setDescription("The search keywords").setRequired(true))
        ),
    run: async ({ client, interaction }) => {
        if (!interaction.member.voice.channel)
            return interaction.editReply("You must be in a voice channel to use this command!")

        const queue = await client.player.createQueue(interaction.guild)

        if (!queue.connection) await queue.connect(interaction.member.voice.channel)

        let embed = new MessageEmbed()

        if (interaction.options.getSubcommand() === "song") {
            let url = interaction.options.getString("url")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            })
            if (result.tracks.length === 0)
                return interaction.editReply("No results found!")

            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`Added **[${song.title}](${song.url})** to the queue!`)
                .setImage(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}` })

        } else if (interaction.options.getSubcommand() === "playlist") {
            let url = interaction.options.getString("url")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
            })


            if (result.tracks.length === 0)
                return interaction.editReply("No results found!")

            const playlist = result.playlist
            await queue.addTracks(result.tracks)
            embed
                .setDescription(`Added **${result.tracks.length} songs from [${playlist.title}](${playlist.url})** to the queue!`)
                .setThumbnail(playlist.thumbnail)

        } else if (interaction.options.getSubcommand() === "search") {
            let url = interaction.options.getString("searchterms")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })


            if (result.tracks.length === 0)
                return interaction.editReply("No results found!")

            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`Added **[${song.title}](${song.url})** to the queue!`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}` })
        }
        if (!queue.playing) await queue.play()
        await interaction.editReply({
            embeds: [embed]
        })
    },
}

const Discord = require("discord.js")
const dotenv = require("dotenv")
const express = require('express')
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const fs = require("fs")
const { Player } = require("discord-player")

dotenv.config()
const TOKEN = process.env.TOKEN
const app = express()

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(process.env.PORT, () => console.log(`Example app listening on port ${process.env.PORT}!`))

const LOAD_SLASH = process.argv[2] == "load"
const CLIENT_ID = "874862468294393927"
const GUILD_ID = "819010906280165417"

const client = new Discord.Client({
    intents:[
        "GUILDS",
        "GUILD_VOICE_STATES"
    ]
})

client.slashcommands = new Discord.Collection()
client.player = new Player(client, {
    ytdlOptions:{
        quality:"highestaudio",
        highWaterMark:1<<25
    }
})

let commands = []

const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"))


for (const file of slashFiles){
    const slashcmd = require(`./slash/${file}`)
    client.slashcommands.set(slashcmd.data.name, slashcmd)
    if(LOAD_SLASH) commands.push(slashcmd.data.toJSON())
}

console.log(commands)

if(LOAD_SLASH){
    const rest = new REST({version:"9"}).setToken(TOKEN)
    console.log("Loading slash commands...")
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
    .then(() => 
        { console.log("Slash commands loaded!")
        process.exit(0)
    }) 
    .catch(err =>{
        if(err){
            console.log(err)
            process.exit(1)
        }
    })
}
else {
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}!`)   
    })
    client.on("interactionCreate", (interaction) => {
        async function handleCommand(){
            console.log("Ai deu ruim");
            if(!interaction.isCommand()) return

            const slashcmd = client.slashcommands.get(interaction.commandName)
            if(!slashcmd) interaction.reply("Not a valid slash command!")

            await interaction.deferReply()
            await slashcmd.run({ client, interaction })
        }
        handleCommand()
    })
    client.login(TOKEN)     
}
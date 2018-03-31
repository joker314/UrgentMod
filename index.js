const Discord = require("discord.js")
const client = new Discord.Client()

const SETTINGS = {
	token: "ND<snip your bot token goes here>uU",
	adminRoles: ["if anyone with", "these roles is NOT offline", "then this bot will", "take over"],
	offlineIf: ["offline"], // perhaps "dnd" or "idle" would be good options to think about?
	someoneBanned: () => {}, // what to do if this bot ends up banning someone (e.g., think about logging it somewhere?)
	target: "ID OF SERVER GOES HERE"
}

const checkIfOnline = () => target.members.every(member => 
								    SETTINGS.offlineIf.includes(member.user.presence.status)
								|| !SETTINGS.adminRoles.some(role => member.roles.exists("name", role))
							)
let target, online

client.on("ready", () => {
	console.log("Readied!")
	target = client.guilds.get(SETTINGS.target)
	online = checkIfOnline()
	console.log(target.members.map(member => [member.user.presence.status === "offline" || !SETTINGS.adminRoles.some(role => member.roles.exists("name", role)), member.user.presence.status === "offline", !SETTINGS.adminRoles.some(role => member.roles.exists("name", role))]))
	client.user.setStatus(online ? "online" : "dnd");
})

client.on("guildMemberUpdate", () => {
	online = checkIfOnline()
	client.user.setStatus(online ? "online" : "dnd");
})

client.on("presenceUpdate", () => {
	online = checkIfOnline()
	client.user.setStatus(online ? "online" : "dnd");
})

client.on("message", msg => {
	let text = msg.content.toLowerCase()
	if(msg.author.bot || !text.startsWith("!urgent")) return "Message not addressed to me";
	if(!msg.guild) {
		msg.reply("I can only deal with issues publicly, unfortunately, because I need the community to decide whether certain decisions should be made (I'm just a robot, and can't actually think!). I'm sorry about that. If there are any moderators online, try and speak to them. If not, and you are experiencing an issue on the server, then you can type the following command in the server: `!urgent ban @user`. This will create a poll to let users decide whether a temporary ban is in order while the moderators are away from Discord. If you want to chat, nobody checks these DMs apart from me, so you can rant a bit and I won't tell anyone what you said.")
	}
	if(online) {
		if(text.startsWith("!urgent ban")) {
			if(msg.mentions.members.size !== 1) {
				msg.reply("Thank you for the report! Please mention exactly one person so I'm 100% sure about who you're talking about.")
				return "Could not pinpoint bad user";
			}
			let userToBeBanned = msg.mentions.members.first()
			msg.channel.send({embed: {title: "Temporary Ban Poll for @" + userToBeBanned.user.username + "#" + userToBeBanned.user.discriminator, color: 0xffffff, description: "Thank you for your report. Given that there are no administrators currently online, then the only remaining option is to vote to decide whether the requested user should be banned from this server. This will be a *temporary* measure until a moderator can review the situation and take further action.\n\n**React with a 💚 to vote 'Don't ban' and ❤ to vote 'Ban'.**\n\nOnce at least two eligible votes have been cast (the user who made this poll *can* vote, the user who we are voting about *cannot*.), I will ban the user if a strict majority has been reached after the poll expires. This poll expires in **3 minutes** from the time it was created.\n\n**We are voting to ban "  + userToBeBanned + "**"}})
			.then(myMsg => myMsg.react("💚").then(() => myMsg.react("❤")).then(() => Promise.resolve(myMsg)))
			.then(myMsg => {
				setTimeout(() => {
					if(!online) {
						msg.channel.send("")
					}
					
					let doNotBan = (myMsg.reactions.find(emoji => emoji.emoji.name === "💚")).count;
					let doBan    = (myMsg.reactions.find(emoji => emoji.emoji.name === "❤")).count;
					
					--doNotBan, --doBan;
					
					
					doNotBan -= myMsg.reactions.some(emoji => emoji.emoji.name === "💚" && emoji.users.has(userToBeBanned.id));
					doBan -= myMsg.reactions.some(emoji => emoji.emoji.name === "❤" && emoji.users.has(userToBeBanned.id));
					
					if(doNotBan + doBan < 2) {
						msg.channel.send({embed: {color: 0xffaa00, description: `${doNotBan} people voted to not ban; and ${doBan} people voted to ban. A total of ${doNotBan + doBan} people voted therefore. The minimum requirement is 2 votes. The user stays.`}})
					} else if (doBan > doNotBan) {
						msg.channel.send({embed: {color: 0xff0000, description: `${doNotBan} people voted to not ban; and ${doBan} people voted to ban. The majority has decided to ban this user. It is for the safety of this community that I am forced to announce, ${userToBeBanned} has been temporarily banned from the server until an admin can intervene`}}).then(() => userToBeBanned.ban("This was a temporary ban. If you are a moderator, please review this ban and decide whether it was justified. The votes to ban were " + doBan + " against " + doNotBan)).then(() => SETTINGS.someoneBanned())
					} else {
						msg.channel.send({embed: {color: 0xff0000, description: `${doNotBan} people voted to not ban; and ${doBan} people voted to ban. The majority has decided to keep this user in the server. I hope they made the right choice. A moderator will sort all this out when they get on.`}})
					}
					
				}, 3 * 60e3)
			})
		}
	} else {
		msg.reply("Thanks for your inquiry! Unfortunately, I cannot handle any requests while there are moderators that are not offline. Please address any queries to them.")
	}
})

client.login(SETTINGS.token)

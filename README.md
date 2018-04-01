# UrgentMod
A Discord moderation bot which uses the community to ban users when the moderators are away.

## Setting up the code
Fill in the `SETTINGS` constant object so it contains the ID of your server, the token of your bot, the roles that you consider "admin" (i.e. when these people are online, this bot goes into Do Not Disturb mode and doesn't try to ban anyone), what action you wish to take when the bot bans someone \[optional] (as an example, consider `() => client.channels.get("ID OF LOG CHANNEL").send("Someone was banned! Check the audit logs!")` or something similar).

Once you've filled in everything that's required, you can get on with setting up the bot for the server. Invite the bot in, and make sure it has the priviliges to ban users. It'll only ban people when all the people with the roles you defined are of the status you defined (this comes with a default value of just "offline". You can expand this to "idle", "dnd", or -- but why would you want to -- "online". Remember that this is an array and can store many values.

## Running the bot
Once you're convinced the bot *can* ban people; try `node index.js`. You should see the following output.

```
Readied!
```

This means the bot has connected to the Discord server safely. Any subsequent messages will be errors and warnings to which you should pay close attention.

## Using the bot
If the bot is running, it may have one of two statuses. If there are online admins, the bot will appear in its do not disturb mode. If, however, there are no admins, the bot will appear in its online mode.

The bot will always reply to messages that start with `!urgent`, so long as it hasn't crashed, but it'll just give a vague rejection response if the bot is in its <abbr title="do not disturb">dnd</abbr> state.

All users of your servers should be taught the bot's only command.

```
!urgent ban @user
```

It'll only work in the main server, and not DMs, and you must mention exactly one user. When you do this, a poll will appear. Reacting with the red heart will vote to ban the user, and reacting with the green heart will vote to keep the user in the server. 

After three minutes, the bot will decide whether to ban the user.

The bot will keep the user in the server if any of the below are true

- Less than two valid votes were cast
- A moderator came online by the end of the three minutes
- At least half of the votes were for the green heart

Otherwise, the bot will ban the user, with a reason field which contained the votes for and against.

A valid vote is a vote which was not cast by the bot itself or the user being voted about. The user who created the vote *can* vote themselves. The bot will vote for both options, so that they are easy to click straight away, though these aren't valid votes and don't count in the score.

A user can make two valid votes (one each way), but this is a waste of voting potential and simply bumps the number of votes past the minimum. Given that not 1 v 1 results in the user remaining on the server, this doesn't seem like a good way to fool the system and so I've decided to leave this in there.

To unban the user, go to `Server Settings > Bans` then select the user and click "Revoke ban".

Enjoy using the bot, and I hope it makes your server a safer place.


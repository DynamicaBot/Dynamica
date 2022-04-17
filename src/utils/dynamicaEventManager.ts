import { DynamicaEventManager } from "@/classes/dynamicaEvent";

const dynamicaManager = new DynamicaEventManager()

dynamicaManager.on('secondaryJoined', (secondary, guildMember) => {
    console.log(`${guildMember.displayName} joined ${secondary.discord.name}`);
})
dynamicaManager.on('secondaryLeft', (secondary, guildMember) => {
    console.log(`${guildMember.displayName} left ${secondary.discord.name}`);
})
dynamicaManager.on('primaryJoined', (primary, guildMember) => {
    console.log(`${guildMember.displayName} joined ${primary.discord.name}`);
})
dynamicaManager.on('primaryLeft', (primary, guildMember) => {
    console.log(`${guildMember.displayName} left ${primary.discord.name}`);
})
dynamicaManager.on('secondaryRefresh', (secondary) => {
    console.log(`${secondary.discord.name} refreshed`);
})

export default dynamicaManager
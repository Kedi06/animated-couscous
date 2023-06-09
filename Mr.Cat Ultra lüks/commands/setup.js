const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup music bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.ADMINISTRATOR)
        .addIntegerOption(option => option
            .setName('voicechannel')
            .setDescription('Voice channel Amount (1-10)')
            .setRequired(true)),

    async execute(interaction, client) {
        const voiceChannelAmount = interaction.options.getInteger('voicechannel');
        const commandChannel = interaction.channel;

        if (voiceChannelAmount < 1 || voiceChannelAmount > 10) {
            await interaction.reply({ content: 'Please enter a number between 1-10', ephemeral: true });
            return;
        }
        if (!fs.existsSync(`./database/${interaction.guild.id}.json`)) {
            await interaction.reply({ content: '🔃 Kurulum Başladı', ephemeral: true });
        } else {
            const channels = interaction.guild.channels.cache.map(channel => channel.id);
            const data = JSON.parse(fs.readFileSync(`./database/${interaction.guild.id}.json`));
            if (commandChannel.id === data.controler) {
                await interaction.reply({ content: '⚠️ Lütfen bu komutu farklı bir kanalda kullanın!', ephemeral: true });
                return;
            }
            await interaction.reply({ content: '⚠️ Kurulum zaten var, sıfırlanıyor...', ephemeral: true });
            if (data.controler && channels.includes(data.controler)) {
                await interaction.guild.channels.cache.get(data.controler).delete();
            }
            if (data.category && channels.includes(data.category)) {
                await interaction.guild.channels.cache.get(data.category).delete();
            }
            if (data.voiceChannels.length > 0) {
                for (const voiceChannel of data.voiceChannels) {
                    if (channels.includes(voiceChannel)) {
                        await interaction.guild.channels.cache.get(voiceChannel).delete();
                    }
                }
            }
        }

        const category = await interaction.guild.channels.create({
            name: `🎶 ${client.user.username} KediDev`,
            type: ChannelType.GuildCategory
        });

        const controler = await interaction.guild.channels.create({
            name: '🎶 Mr.Cat',
            type: ChannelType.GuildText,
            parent: category,
            topic: `Bu kanaldan botu kontrol edebilirsiniz.`
        });

        const musicVoiceChannels = [];
        for (let i = 0; i < voiceChannelAmount; i++) {
            const voiceChannel = await interaction.guild.channels.create({
                name: `🎶 Music ${i + 1}`,
                type: ChannelType.GuildVoice,
                parent: category,
                userLimit: 99
        
            });

            musicVoiceChannels.push(voiceChannel.id);
        }

        const controlRow1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('play')
                    .setLabel('▶️ Çal')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('pause')
                    .setLabel('⏸️ DurDur')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('⏭️ Sonraki')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('loop')
                    .setLabel('🔁 Döngü')
                    .setStyle(ButtonStyle.Secondary),
            );

        const controlRow2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('stop')
                    .setLabel('📛 Kapat')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('queue')
                    .setLabel('🎶 Liste')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('search')
                    .setLabel('🎶 Ara')
                    .setStyle(ButtonStyle.Success),
            );


        const controlerEmbed = new EmbedBuilder()
            .setTitle('🎶 MR.Cat Kumanda')
            .setDescription('Müzik botunu kontrol etmek için aşağıdaki düğmeleri kullanın.')
            .setColor('#6104b9')
            .addFields(
                { name: '▶️ Çal', value: 'Müzik Çal', inline: true },
                { name: '⏸️ Durdur', value: 'Müziği Durdur', inline: true },
                { name: '⏭️ Sonraki', value: 'Şarkıyı Atla', inline: true },
                { name: '🔁 Döngü', value: 'Şarkıyı Döngüye Al', inline: true },
                { name: '📛 Kapat', value: 'Şarkıyı Kapat', inline: true },
                { name: '🎶 Sıra', value: 'Şarkı Listesi', inline: true },
                { name: '📌 Bilgilendirme', value: 'Bu kanalda konuşamazsınız.\'Müzik botunu kontrol etmek için düğmeleri kullanın' }
            )
            .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
            .setTimestamp();


        fs.writeFileSync(`./database/${interaction.guild.id}.json`, JSON.stringify({ controler: controler.id, category: category.id,}, null, 4));
        await controler.send({ embeds: [controlerEmbed], components: [controlRow1, controlRow2] });
        await interaction.editReply({ content: `✅ Kurulum tammalandı ve hazır hadi hayırlı olsun!\n\n🎶 Katogori: ${category}\n🎶 Kontrol Kanlı: ${controler}\n🎶`, ephemeral: true });
    }
}
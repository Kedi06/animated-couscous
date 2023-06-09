const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { YouTubeAPI } = require('../config.json');

module.exports = {
    name: 'interactionCreate',
    once: false,

    async execute(interaction, client) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === 'playModal') {
            const musicNameOrLink = interaction.fields.getTextInputValue('playInput');

            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) return interaction.reply({ content: 'Önce bir ses kanalına katılmanız gerekiyor!', ephemeral: true });

            const permissions = voiceChannel.permissionsFor(interaction.client.user);

            if (!permissions.has(PermissionFlagsBits.ViewChannel)) return interaction.reply({ content: 'Ses kanalınıza bağlanamıyorum, uygun izinlere sahip olduğumdan emin olun!', ephemeral: true });
            if (!permissions.has(PermissionFlagsBits.Connect)) return interaction.reply({ content: 'Ses kanalınıza bağlanamıyorum, uygun izinlere sahip olduğumdan emin olun!', ephemeral: true });
            if (!permissions.has(PermissionFlagsBits.Speak)) return interaction.reply({ content: 'Ses kanalınıza bağlanamıyorum, uygun izinlere sahip olduğumdan emin olun!', ephemeral: true });

            await interaction.deferReply({ ephemeral: false });

            if (musicNameOrLink.includes('https://' || 'http://')) {
                if (!musicNameOrLink.includes('youtube.com' || 'youtu.be' || 'open.spotify.com/playlist')) {
                    return interaction.followUp({ content: 'Bu geçerli bir YouTube bağlantısı değil', ephemeral: true });
                } else {
                    try {
                        await client.distube.play(voiceChannel, musicNameOrLink, { member: interaction.member });
                    } catch (err) {
                        if (err) return interaction.editReply({ content: 'Bu geçerli bir YouTube bağlantısı değil', ephemeral: true });
                    }
                }
            } else {
                await client.distube.play(voiceChannel, musicNameOrLink, { member: interaction.member });
            }

            const queue = await client.distube.getQueue(interaction.guildId);
            const lastSong = queue.songs[queue.songs.length - 1];

            const musicEmbed = new EmbedBuilder()
                .setURL(lastSong.url)
                .setDescription(`**Name:** ${lastSong.name}`)
                .setColor('#6104b9')
                .addFields(
                    { name: '👤 Tükleyici', value: `[${lastSong.uploader.name}](${lastSong.uploader.url})`, inline: true },
                    { name: '👁‍🗨 Görüntüleme', value: `${lastSong.views}`, inline: true },
                    { name: '⏱️ Süre', value: `${lastSong.formattedDuration}`, inline: true },
                    { name: '👍 Like', value: `${lastSong.likes}`, inline: true },
                    { name: '👎 Dislikes', value: `${lastSong.dislikes}`, inline: true },
                    { name: '🔴 Canlı', value: `${lastSong.isLive ? 'Yes' : 'No'}`, inline: true }
                )
                .setImage(lastSong.thumbnail)
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            if (!queue) {
                musicEmbed.setTitle('🎵 Çalıyor');
            } else {
                musicEmbed.setTitle('🎵 Kuyruğa eklendi');
            }

            const bilgi = await interaction.editReply({ embeds: [musicEmbed] });
            setTimeout(() => {
                if (bilgi && !bilgi.deleted) {
                  bilgi.delete().catch(console.error);
                }
              }, 50000);
            const durationString = lastSong.formattedDuration;
            const duration = parseDuration(durationString); // Süreyi ayrıştır
            setTimeout(() => {
                bilgi.delete();
            }, duration * 1000);
            function parseDuration(durationString) {
                const matches = durationString.match(/(\d+):(\d+)/); // Dakika ve saniye eşleşmelerini bul
                if (matches) {
                    const minutes = parseInt(matches[1]);
                    const seconds = parseInt(matches[2]);
                    return minutes * 60 + seconds; // Süreyi saniyeye dönüştür
                }
                return 0; // Geçersiz süre durumunda varsayılan olarak 0 döndür
            }
        } else if (interaction.customId === 'searchModal') {
            const searchName = interaction.fields.getTextInputValue('searchInput');
            
            const search = await client.distube.search(searchName, { limit: 10, type: 'video' });

            const nameReplace = searchName.replace(/ /g, '+');

            const embed = new EmbedBuilder()
                .setTitle('🔍 Youtube da Arama')
                .setURL(`https://www.youtube.com/results?search_query=${nameReplace}`)
                .setDescription(`**Name:** ${searchName}`)
                .setColor('#6104b9')
                .setImage(search[0].thumbnail)
                .setFooter({ text: `İsteyen Kişi ${interaction.user.tag}`, iconURL: interaction.user.avatarURL({ dynamic: true }) })
                .setTimestamp();
                
            for (let i = 0; i < search.length; i++) {
                embed.addFields({ name: `${i + 1}. ${search[i].name}`, value: `**Kanal:** ${search[i].uploader.name}\n**Link:** ${search[i].url}` });
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
}
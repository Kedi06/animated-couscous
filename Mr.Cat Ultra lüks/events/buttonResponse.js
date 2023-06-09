const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client ) {
        if (!interaction.isButton()) return;
        const guildID = interaction.guildId;

        const button = interaction.customId;
        if (!button) return;

        const queue = client.distube.getQueue(guildID);

        if (button === 'play') {
            const playModal = new ModalBuilder()
			.setCustomId('playModal')
			.setTitle('Play')



		    const playInput = new TextInputBuilder()
		    	.setCustomId('playInput')
		    	.setLabel("Bir müzik ismi veya linki yaz")
		    	.setStyle(TextInputStyle.Short) 
                .setRequired(true);

		    const playActionRow = new ActionRowBuilder().addComponents(playInput);

		    playModal.addComponents(playActionRow);



  
		    await interaction.showModal(playModal);
        } else if (button === 'pause') {
            if (!queue) return interaction.reply({ content: '⚠️ Çalan bir şey yok!', ephemeral: true });


            if (queue.paused) {
                client.distube.resume(guildID);
                await interaction.reply({ content: '▶️ Müziği devam etti!', ephemeral: true });
            } else {
                client.distube.pause(guildID);
                await interaction.reply({ content: '⏸️ Müziği duraklattı!', ephemeral: true });
            }
        } else if (button === 'next') {
            if (!queue) return interaction.reply({ content: '⚠️ Çalan bir şey yok!', ephemeral: true });

            if (queue.songs.length === 1) return interaction.reply({ content: '⚠️ Bu son şarkı!', ephemeral: true });

            client.distube.skip(guildID);

            const embed = new EmbedBuilder()
                .setTitle('⏭🎶 Şarkı atlandı!')
                .setDescription(`**Çalan Şarkı:** ${queue.songs[0].name}\n**Süre:** ${queue.songs[0].formattedDuration}\n**Şarkıyı Açan Kişi:** ${queue.songs[0].user}`)
                .setColor('#6104b9')
                .setThumbnail(queue.songs[0].thumbnail)
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (button === 'loop') {
            if (!queue) return interaction.reply({ content: '⚠️ Çalan bir şey yok!', ephemeral: true });

            if (queue.repeatMode === 0) {
                client.distube.setRepeatMode(guildID, 1);
                await interaction.reply({ content: '🔁 Sıradaki tüm şarkılar döngüye alınıyor!', ephemeral: true });
            } else if (queue.repeatMode === 1) {
                client.distube.setRepeatMode(guildID, 2);
                await interaction.reply({ content: '🔂  Geçerli şarkı sadece döngüye  alınıyor!', ephemeral: true });
            } else {
                client.distube.setRepeatMode(guildID, 0);
                await interaction.reply({ content: '🔁 Döngü iptal!', ephemeral: true });
            }
        }  else if (button === 'queue') {
            if (!queue) return interaction.reply({ content: '⚠️ Çalan bir şey yok!', ephemeral: true });

            const queueEmbed = new EmbedBuilder()
                .setTitle('🎶 Sıra')
                .setColor('#6104b9')
                .setThumbnail(queue.songs[0].thumbnail)
                .setFooter({ text: `Page 1 of ${Math.ceil(queue.songs.length / 5)}`, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 4096 }) })
                .setTimestamp();

            for (let i = 0; i < 5; i++) {
                if (!queue.songs[i]) break;
                queueEmbed.addFields({ name: `${i + 1}. ${queue.songs[i].name}`, value: `Süre: ${queue.songs[i].formattedDuration} | Açan Kişi: ${queue.songs[i].user}` });
            }

            const queueRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('queuePrevious')
                        .setEmoji('⬅️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('queueNext')
                        .setEmoji('➡️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(queue.songs.length <= 5)
                );

             await interaction.reply({ embeds: [queueEmbed], components: [queueRow], fetchReply: true , ephemeral: true});
            const filter = (i) => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            let page = 1;
            collector.on('collect', async (i) => {
                if (i.customId === 'queuePrevious') {
                    page--;
                    for (let i = (page - 1) * 5; i < page * 5; i++) {
                        if (!queue.songs[i]) break;
                        queueEmbed.spliceFields(i - (page - 1) * 5, 1, { name: `${i + 1}. ${queue.songs[i].name}`, value: `Süre: ${queue.songs[i].formattedDuration} | Açan Kişi: ${queue.songs[i].user}` });
                    }

                    queueEmbed.setFooter({ text: `Page ${page} of ${Math.ceil(queue.songs.length / 5)}`, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 4096 }) });
                } else if (i.customId === 'queueNext') {
                    page++;
                    queueEmbed.setFields();
                    for (let i = (page - 1) * 5; i < page * 5; i++) {
                        if (!queue.songs[i]) break;
                        queueEmbed.addFields({ name: `${i + 1}. ${queue.songs[i].name}`, value: `Süre: ${queue.songs[i].formattedDuration} | Açan Kişi: ${queue.songs[i].user}` });
                    }

                    queueEmbed.setFooter({ text: `Page ${page} of ${Math.ceil(queue.songs.length / 5)}`, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 4096 }) });
                }

                queueRow.components[0].setDisabled(page === 1);
                queueRow.components[1].setDisabled(page === Math.ceil(queue.songs.length / 5));
                setTimeout(() => sıra.delete(), 3000);
            });


        }
        
        else if (button === 'stop') { 
            const stophModal = new ModalBuilder()
            if (!queue) return interaction.reply({ content: '⚠️ Çalan bir şey yok!', ephemeral: true });



            client.distube.stop(guildID);

            const reply = await interaction.channel.send({ content: '⏹️ Müziği kapattı!', ephemeral: true });
            setTimeout(() => reply.delete(), 2000);
        } else if (button === 'nowplaying') {
            if (!queue) return interaction.reply({ content: '⚠️ Çalan bir şey yok!', ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle('🎶 Çalan Şarkı')
                .setDescription(`**${queue.songs[0].name}**\n**Süre:** ${queue.songs[0].formattedDuration}\n**Açan Kişi:** ${queue.songs[0].user}`)
                .setColor('#6104b9')
                .setThumbnail(queue.songs[0].thumbnail)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 4096 }) })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (button === 'search') {
            const searchModal = new ModalBuilder()
            .setCustomId('searchModal')
            .setTitle('Ara')

            const searchInput = new TextInputBuilder()
            	.setCustomId('searchInput')
            	.setLabel("Aramak için bir Müzik Adı girin")
            	.setStyle(TextInputStyle.Short)
                .setRequired(true);

            const searchActionRow = new ActionRowBuilder().addComponents(searchInput);

            searchModal.addComponents(searchActionRow);

            await interaction.showModal(searchModal);
        }
        
    }
    

    
}

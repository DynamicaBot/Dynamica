import Event from '@classes/event';
import DynamicaPrimary from '@classes/primary';
import DynamicaSecondary from '@classes/secondary';

export default new Event<'channelDelete'>()
  .setOnce(false)
  .setEvent('channelDelete')
  .setResponse(async (channel) => {
    // logger.debug(channel);
    const primary = await new DynamicaPrimary(
      channel.client,
      channel.id
    ).fetch();
    const secondary = await new DynamicaSecondary(
      channel.client,
      channel.id
    ).fetch();

    if (primary) {
      primary.delete();
    } else if (secondary) {
      secondary.delete();
    }
  });

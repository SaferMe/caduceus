import Route from '@ember/routing/route';
import fetch from 'fetch';

export default class ChannelRoute extends Route {
  async model(params) {
    const response = await fetch(
      `http://localhost:3000/api/v4/channels/${params.channelId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token token=public',
          'X-AppId': 'com.thundermaps.saferme',
          'X-InstallationId': 'generic-public-access',
        }
      }
    );
    const channel = await response.json();
    return channel;
  }
}

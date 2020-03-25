import Route from '@ember/routing/route';
import fetch from 'fetch';
import ENV from 'shield/config/environment'

export default class ChannelRoute extends Route {
  async model(params) {
    let [channelId, webFormToken] = params.channelId.split('-');
    const response = await fetch(`${ENV.apiHost}/api/x1/channels/${channelId}?web_form_token=${webFormToken}`);
    const channel = await response.json();
    channel.webFormToken = webFormToken;
    return channel;
  }
}

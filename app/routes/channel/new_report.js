import Route from '@ember/routing/route';
import fetch from 'fetch';

export default class NewReportRoute extends Route {
  async model(params) {
    const channelParams = this.paramsFor('channel')
    const response = await fetch(
      `http://localhost:3000/api/v4/channels/${channelParams.channelId}/form`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token token=public',
          'X-AppId': 'com.thundermaps.saferme',
          'X-InstallationId': 'generic-public-access',
        }
      }
    );
    const form = await response.json();
    return form;
  }
}

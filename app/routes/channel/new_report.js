import Route from '@ember/routing/route';
import fetch from 'fetch';

export default class NewReportRoute extends Route {
  async model(params) {
    const channel = this.modelFor('channel');
    const response = await fetch(
      `http://localhost:3000/api/v4/channels/${channel.id}/form`,
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
    return {channel: channel, fields: form.fields.filterBy('editable')};
  }
}

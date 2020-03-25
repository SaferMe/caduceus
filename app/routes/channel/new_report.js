import Route from '@ember/routing/route';
import fetch from 'fetch';
import ENV from 'shield/config/environment'

export default class NewReportRoute extends Route {
  async model(params) {
    const channel = this.modelFor('channel');
    const response = await fetch(`${ENV.apiHost}/api/x1/channels/${channel.id}/form?web_form_token=${channel.webFormToken}`);
    const form = await response.json();
    return {channel: channel, fields: form.fields.filterBy('editable')};
  }
}

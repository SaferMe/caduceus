import Route from '@ember/routing/route';
import fetch from 'fetch';
import ENV from 'shield/config/environment'

import { isBlank, isNone, isEmpty } from '@ember/utils';

// Extract a fixed location information using the following valid formats:
// 'lat,lng'
// 'lat,lng,address'
// examples:
// -41.225987,174.881669
// -41.225987,174.881669,Restaurant Name
// -41.225987,174.881669,123 Jackson Street. Lower Hutt
function extractFixedLocation(fixedLocationString) {
  if (isEmpty(fixedLocationString)) {
    return null;
  }
  const [latStr, lngStr] = fixedLocationString.split(",");
  const lngStart = fixedLocationString.indexOf(',', 0);
  const descriptionStart = fixedLocationString.indexOf(',', lngStart + 1);
  let description;
  if (lngStart != -1 && descriptionStart != -1)  {
    description = fixedLocationString.slice(descriptionStart + 1);
  }
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if(isNaN(lat) || isNaN(lng)) {
    return null;
  }

  return {location: {lng, lat}, description};
}

export default class NewReportRoute extends Route {
  queryParams = {
    fixed_location: {
      refreshModel: true
    }
  }
  async model(params) {
    const channel = this.modelFor('channel');
    const response = await fetch(`${ENV.apiHost}/api/x1/channels/${channel.id}/form?web_form_token=${channel.webFormToken}`);
    const form = await response.json();
    const fixedLocation = extractFixedLocation(params.fixed_location);
    return {channel: channel, fields: form.fields.filterBy('editable'), fixedLocation};
  }
}

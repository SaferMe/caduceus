import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('channel', {path: '/channel/:channelId'}, function() {
    this.route('new_report');
    this.route('report_created');
  });
});

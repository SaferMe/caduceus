import Component from '@glimmer/component';
import { action } from "@ember/object";
export default class NewReportFormComponent extends Component {
  @action
  send() {
    console.log("sending", {channel: this.args.channel, fields: this.args.fields});
  }
}

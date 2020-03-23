import Component from '@glimmer/component';
import { action, set } from "@ember/object";
import fetch from 'fetch';

const FieldsMapping = {
  'ShortTextBox': 'string',
  'LongTextBox': 'text',
}

export default class NewReportFormComponent extends Component {
  formData = {};
  constructor(owner, args) {
    super(owner, args);

    this.args.fields.forEach((f) => {
      if (FieldsMapping[f.field_type]) {
        set(this.formData, f.key, f.value);
      }
    })
  }

  get sortedFields() {
    return this.args.fields.map((f) => {
      const fieldType = FieldsMapping[f.field_type];
      if (fieldType) {
        return {...f, fieldType};
      }
    }).compact().sortBy('form_order');
  }

  @action
  async send() {
    console.log("sending", {channel: this.args.channel, fields: this.args.fields});
    const body = Object.assign({}, this.formData, {
      account_id: this.args.channel.id,
      geom: "Point(174.868709 -41.213559)",
      address: "lat: -41.213559, long: 174.868709",
    });
    let report, errors;
    try {
      const response = await fetch(
        `http://localhost:3000/api/v4/reports`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token token=public',
            'X-AppId': 'com.thundermaps.saferme',
            'X-InstallationId': 'generic-public-access',
          },
          body: JSON.stringify(body),
        }
      );
      if (response.ok) {
        report = await response.json();
      }
      else if (response.status === 422) {
        // validation errors
        errors = await response.json();
      }
    }
    catch (e) {
      console.log(e);
    }
    console.log(report, errors);
  }
}

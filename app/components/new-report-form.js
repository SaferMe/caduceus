import Component from '@glimmer/component';
import { action, set } from "@ember/object";

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
  send() {
    console.log("sending", {channel: this.args.channel, fields: this.args.fields});
  }
}

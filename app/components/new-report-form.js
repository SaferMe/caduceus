import Component from '@glimmer/component';
import { action, get, getWithDefault, set } from "@ember/object";
import fetch from 'fetch';

const FieldsMapping = {
  // 'BulletedList': {inputType: 'pending'},
  // 'Category': {inputType: 'pending'},
  'CheckBox': {inputType: 'multi-checkboxes'},
  // 'DateAndTime': {inputType: 'pending'},
  'DropDown': {inputType: 'collection'},
  // 'FileUpload': {inputType: 'pending'},
  'FreeText': {inputType: 'informational-text', dontSend: true, unescapeLabel: true},
  // 'Image': {inputType: 'pending'},
  // 'IntegerRange': {inputType: 'pending'},
  'LongTextBox': {inputType: 'text'},
  // 'NumberedList': {inputType: 'pending'},
  'RadioButton': {inputType: 'radio-select'},
  // 'RelativePosition': {inputType: 'not needed'},
  // 'ReportState': {inputType: 'pending'},
  // 'ReportViewers': {inputType: 'not needded'},
  // 'RiskMatrix': {inputType: 'pending'},
  'SectionBreak': {inputType: 'section-break', hideLabel: true, dontSend: true},
  'ShortTextBox': {inputType: 'string'},
  // 'Signature': {inputType: 'pending'},
  // 'TextWithSuggestions': {inputType: 'pending'},
}

export default class NewReportFormComponent extends Component {
  formData = {};
  constructor(owner, args) {
    super(owner, args);

    this.args.fields.forEach((f) => {
      const fieldDef = FieldsMapping[f.field_type] || {};
      const sendField = !get(fieldDef, 'dontSend');
      if (sendField) {
        if (get(f.data, 'multi_select')) {
          set(this.formData, f.key, f.value || []);
        }
        else {
          set(this.formData, f.key, f.value);
        }
      }
    })
  }

  get sortedFields() {
    return this.args.fields.map((f) => {
      const fieldDef = FieldsMapping[f.field_type];
      if (fieldDef) {
        const optionCollection = getWithDefault(f.data, 'options', []).filterBy('enabled').sortBy('display_order');
        optionCollection.forEach((option) => {
          option.content = option.value;
          this.formData[f.key]
        });
        let label;
        if (fieldDef.hideLabel) {
          label = false;
        }
        else {
          label = f.label;
          if (fieldDef.unescapeLabel) {
            label = label.htmlSafe();
          }
        }
        const fieldType = fieldDef.inputType;

        return {...f, label, fieldType, optionCollection};
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

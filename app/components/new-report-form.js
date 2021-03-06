import Component from '@glimmer/component';
import { action, get, getWithDefault, set } from "@ember/object";
import fetch from 'fetch';
import {inject as service} from '@ember/service';
import { validator, buildValidations } from 'ember-cp-validations';
import EmberObject from '@ember/object';

import ENV from 'shield/config/environment'

const FieldsMapping = {
  // 'BulletedList': {inputType: 'pending'},
  // 'Category': {inputType: 'pending'},
  'CheckBox': {inputType: 'checkboxes'},
  'DateAndTime': {inputType: 'datetime-local'},
  'DropDown': {inputType: 'power-collection'},
  // 'FileUpload': {inputType: 'pending'},
  'FreeText': {inputType: 'void', dontSend: true, unescapeLabel: true, wrapper: 'unstyled'},
  // 'Image': {inputType: 'pending'},
  'IntegerRange': {inputType: 'ticked-range'},
  'LongTextBox': {inputType: 'text'},
  // 'NumberedList': {inputType: 'pending'},
  'RadioButton': {inputType: 'checkboxes'},
  'RelativePosition': {inputType: 'void', dontSend: true, hideLabel: true},
  // 'ReportState': {inputType: 'pending'},
  'ReportViewers': {inputType: 'void', dontSend: true, hideLabel: true},
  // 'RiskMatrix': {inputType: 'pending'},
  'SectionBreak': {inputType: 'section-break', hideLabel: true, dontSend: true},
  'ShortTextBox': {inputType: 'string'},
  'Signature': {inputType: 'void', dontSend: true, hideLabel: true},

  // missing suggestions
  'TextWithSuggestions': {inputType: 'string'},
}

export default class NewReportFormComponent extends Component {
  @service router;

  validations = {};

  formData = null;

  constructor() {
    super(...arguments);

    if(!this.args.fixedLocation) {
      this.validations["place"] = [validator('presence', true)];
    }

    let fd = {account_id: this.args.channel.id};

    this.sortedFields.forEach((f) => {
      if (!f.dontSend) {
        if (get(f.data, 'multi_select')) {
          if (f.mandatory) {
            this.validations[f.key] = [validator('collection', true), validator('presence', true)];
          }
          set(fd, f.key, f.value || f.optionCollection.filterBy('is_default').mapBy('value'));
        }
        else {
          if (f.mandatory) {
            this.validations[f.key] = [validator('presence', true)];
          }
          if (f.field_type === "DateAndTime" && get(f.data, 'default_to_current')) {
            set(fd, f.key, f.value || new Date().toJSON());
          }
          else if (f.field_type === "IntegerRange") {
            this.validations[f.key] = [
              validator('number', {
                integer: true,
                gte: f.data.minimum,
                lte: f.data.maximum,
              })
            ];
            set(fd, f.key, f.value || f.data.default);
          }
          else {
            set(fd, f.key, f.value || (f.optionCollection.findBy('is_default') || {}).value);
          }
        }
      }
    });

    this.formData = EmberObject.extend(buildValidations(this.validations)).create(Ember.getOwner(this).ownerInjection(), fd);
  }

  get sortedFields() {
    return this.args.fields.map((f) => {
      const fieldDef = FieldsMapping[f.field_type];
      if (fieldDef && f.field_visibility == "public") {
        const optionCollection = getWithDefault(f.data, 'options', []).filterBy('enabled').sortBy('display_order');
        optionCollection.forEach((option) => {
          option.content = option.value;
        });

        if (fieldDef.inputType === 'collection') {
          optionCollection.unshift({});
        }

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
        const inputType = fieldDef.inputType;
        const wrapper = fieldDef.wrapper || 'default';
        const dontSend = fieldDef.dontSend || false;

        return {...f, label, inputType, dontSend, wrapper, optionCollection};
      }
    }).compact().sortBy('form_order');
  }

  @action
  async send() {
    const {validations} = await this.formData.validate();
    if (validations.isInvalid) {
      return
    }

    let {account_id, place, ...customFields} = this.formData;
    let custom_field_values = [];
    const ignoredKeys = ['_super', '_oldWillDestroy', 'willDestroy'];
    Object.keys(customFields).forEach((key) => {
      if (ignoredKeys.includes(key)) {
        return;
      }
      custom_field_values.push({key: key, value: customFields[key]});
    })

    let address;
    let geom;
    if (this.args.fixedLocation) {
      address = this.args.fixedLocation.description;
      geom = `Point(${this.args.fixedLocation.location.lng} ${this.args.fixedLocation.location.lat})`;
    }
    else {
      address = place.description;
      geom = `Point(${place.location.lng} ${place.location.lat})`;
    }
    const report = {account_id, geom, address, custom_field_values};

    let errors;
    try {
      const response = await fetch(
        `${ENV.apiHost}/api/x1/reports?web_form_token=${this.args.channel.webFormToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({report}),
        }
      );
      if (response.ok) {
        let data = await response.json();
        this.router.transitionTo('channel.report_created')
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

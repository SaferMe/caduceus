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
  // 'DateAndTime': {inputType: 'pending'},
  'DropDown': {inputType: 'collection'},
  // 'FileUpload': {inputType: 'pending'},
  'FreeText': {inputType: 'void', dontSend: true, unescapeLabel: true, wrapper: 'unstyled'},
  // 'Image': {inputType: 'pending'},
  // 'IntegerRange': {inputType: 'pending'},
  'LongTextBox': {inputType: 'text'},
  // 'NumberedList': {inputType: 'pending'},
  'RadioButton': {inputType: 'checkboxes'},
  // 'RelativePosition': {inputType: 'not needed'},
  // 'ReportState': {inputType: 'pending'},
  // 'ReportViewers': {inputType: 'not needded'},
  // 'RiskMatrix': {inputType: 'pending'},
  'SectionBreak': {inputType: 'section-break', hideLabel: true, dontSend: true},
  'ShortTextBox': {inputType: 'string'},
  'Signature': {inputType: 'void', dontSend: true, hideLabel: true},
  // 'TextWithSuggestions': {inputType: 'pending'},
}

export default class NewReportFormComponent extends Component {
  @service router;

  validations = {
    geom: [validator('presence', true)],
    // address: [validator('presence', true)],
  };

  formData = null;
  showAddressError = false;

  constructor(owner, args) {
    super(owner, args);

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
          set(fd, f.key, f.value || (f.optionCollection.findBy('is_default') || {}).value);
        }
      }
    });

    this.formData = EmberObject.extend(buildValidations(this.validations)).create(Ember.getOwner(this).ownerInjection(), fd);
  }

  get sortedFields() {
    return this.args.fields.map((f) => {
      const fieldDef = FieldsMapping[f.field_type];
      if (fieldDef) {
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
  addressUpdated(place) {
    const geom = `Point(${place.geometry.location.lng()} ${place.geometry.location.lat()})`;
    const address = place.formatted_address;
    set(this.formData, 'geom', geom);
    set(this.formData, 'address', address);
  }

  @action
  async send() {
    const {validations} = await this.formData.validate();
    if (validations.isInvalid) {
      return
    }

    console.log("sending", {channel: this.args.channel, fields: this.args.fields});
    const body = Object.assign({}, this.formData);
    let report, errors;
    try {
      const response = await fetch(
        `${ENV.apiHost}/api/v4/reports`,
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

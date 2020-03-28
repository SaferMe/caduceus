import Component from '@glimmer/component';
import ObjectProxy from '@ember/object/proxy';
import { get, set } from '@ember/object';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
import { resolve } from 'rsvp';

export default class NewReportFormComponent extends Component {
  selectedItem = null

  constructor() {
    super(...arguments);
    this.selectedItem = this.collection.find((i) => i.value == this.args.config.value);
  }

  get notRequired() {
    return !this.args.config.validations.required;
  }

  select(newValue) {
    set(this, 'selectedItem', newValue);
    set(this, 'args.config.value', get(newValue || {}, 'value'));
  }

  get collection() {
    return this.args.config.collection;
  }

  get resolvedCollection() {
    return (this.collection || []).map((option) => {
      if (typeof option === 'object') {
        return option;
      } else {
        return {
          value:    option,
          label:    option,
          content:  option
        };
      }
    });
  }
}

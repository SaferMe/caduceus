import Ember from "ember";
import { isPresent } from '@ember/utils';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default Ember.Component.extend({
  classNames: ["ticked-range"],

  backgroundColor: computed('min', 'max', {
    get() {
      return this.config.color || "transparent";
    }
  }),

  tickList: computed('min', 'max', {
    get() {
      if (this.min >= this.max) {
        return [this.min];
      }
      let list = [];
      for(let i = this.min; i <= this.max; i++) {
        list.push(i);
      }
      return list;
    }
  }),

  validations: reads('config.validations.number'),

  min: computed('validations.{gt,gte}', 'step', {
    get() {
      var n = this.get('validations.gt');
      if (isPresent(n)) {
        return n * 1 + this.get('step');
      } else {
        return this.get('validations.gte');
      }
    }
  }),

  max: computed('validations.{lt,lte}', 'step', {
    get() {
      var n = this.get('validations.lt');
      if (isPresent(n)) {
        return n * 1 - this.get('step');
      } else {
        return this.get('validations.lte');
      }
    }
  })
});

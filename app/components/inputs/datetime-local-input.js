import DateInput from "ember-form-builder/components/inputs/date-input";
import { computed } from '@ember/object';

export default DateInput.extend({
  type: 'datetime-local',

  value: computed('config.value', {
    get() {
      var date = this.get('config.value');
      return formatDate(date);
    },
    set(key, value) {
      if (value.length === 0) {
        this.set('config.value', undefined);
      } else {
        var timestamp = Date.parse(value);
        if (isNaN(timestamp)) {
          return value;
        } else {
          var date = new Date(timestamp);
          this.set('config.value', date.toJSON());
          return formatDate(date);
        }
      }
      return undefined;
    }
  })
});

function pad(number, length = 2) {
  let result = number.toString();
  length = length - result.length;
  if (length > 0) {
    return Array(length + 1).join('0') + result;
  }
  return result;
}

function formatDate(date) {
  if (date && date.getFullYear && date.getMonth && date.getDate && date.getHours && date.getMinutes && date.getSeconds) {
    return pad(date.getFullYear(), 4) +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T'+ pad(date.getHours()) +
        ':'+ pad(date.getMinutes()) +
        ':'+ pad(date.getSeconds());
  }

  if (date && date.match) {
    if (date.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/)) {
      return date;
    }

    if (date.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?Z/)) {
      var timestamp = Date.parse(date);
      if (!isNaN(timestamp)) {
        return formatDate(new Date(timestamp));
      }
    }
  }

  return null;
}

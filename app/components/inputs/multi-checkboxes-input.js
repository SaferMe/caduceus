import TextInput from "ember-form-builder/components/inputs/checkboxes-input";
import { set } from "@ember/object";

export default TextInput.extend({
  init() {
    this._super();
    set(this, 'multiple', true);
  },
});

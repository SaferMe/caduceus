import Component from '@glimmer/component';

const FieldTypeMapping = {
  "ShortTextBox": "channel-form/short-text-field",
};

export default class ChannelFormFormFieldComponent extends Component {
  get fieldType() {
    return FieldTypeMapping[this.args.field.field_type] || "channel-form/null-field"
  }
}

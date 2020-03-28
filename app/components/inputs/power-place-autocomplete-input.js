import Component from '@glimmer/component';
import ObjectProxy from '@ember/object/proxy';
import { action, get, set } from '@ember/object';
import { isBlank } from '@ember/utils';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
import { resolve } from 'rsvp';
import { inject as service } from '@ember/service';

export default class NewReportFormComponent extends Component {
  minSearchStringLength = 3;
  @service('google-place-autocomplete') googlePlaceAutocompleteService;

  constructor() {
    super(...arguments);
  }

  @action
  async select(newValue) {
    if (isBlank(newValue)) {
      set(this, 'args.config.value', {});
      return;
    }

    let googleRequest = {
      placeId: newValue.place_id,
      fields: ['geometry.location'],
    };
    let placeDetails = await this.googlePlaceAutocompleteService.getDetails(googleRequest);

    if (get(placeDetails, 'geometry.location')) {
      newValue.location = {
        lat: placeDetails.geometry.location.lat(),
        lng: placeDetails.geometry.location.lng(),
      };
    }

    set(this, 'args.config.value', newValue);
  }

  get selectedItem() {
    return this.args.config.value;
  }

  @action
  searchPlaces(placeServiceInput) {
    if (isBlank(placeServiceInput) || placeServiceInput.length < this.minSearchStringLength) {
      return [];
    }
    let properties = {
      input: placeServiceInput,
      types: ["address"],
      offset: this.minSearchStringLength,
    };
    return this.googlePlaceAutocompleteService.getPlacePredictions(properties);
  }
}

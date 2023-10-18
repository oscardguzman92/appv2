import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationHelper} from './navigation/navigation.helper';
import {UtilitiesHelper} from './utilities/utilities.helper';
import {OrganizeShopsHelper} from './organizeShops/organizeShops.helper';
import {GeolocationHelper} from './geolocation/geolocation.helper';

@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ],
    providers: [
        NavigationHelper,
        UtilitiesHelper,
        OrganizeShopsHelper,
        GeolocationHelper
    ]
})
export class HelpersModule {
}

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule, PERSISTENCE } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from 'src/environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Store
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { apiErrorReducer } from 'src/store/api/api.store';
import { guardianReducer } from 'src/store/guardian/guardian.store';
import { wardReducer } from 'src/store/ward/ward.store';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { householdReducer } from 'src/store/household/household.store';

// Declarations
import { GuardianLayoutComponent } from './guardian/guardian-layout/guardian-layout.component';
import { WardLandingComponent } from './ward/ward-landing/ward-landing.component';
import { GuardianSummaryComponent } from './guardian/guardian-summary/guardian-summary.component';
import { CreateQuestComponent } from './components/modals/create-quest/create-quest.component';
import { SelectComponent } from './components/core/select/select.component';
import { SelectComponentForm } from './components/core/select/gl-select.component';
import { ViewQuestComponent } from './components/modals/view-quest/view-quest.component';
import { EditQuestComponent } from './components/modals/edit-quest/edit-quest.component';
import { GuardianPerksComponent } from './guardian/guardian-perks/guardian-perks.component';
import { CreatePerkComponent } from './components/modals/create-perk/create-perk.component';
import { PerkCardComponent } from './components/core/perk-card/perk-card.component';
import { EditPerkComponent } from './components/modals/edit-perk/edit-perk.component';
import { PerkRedeemComponent } from './components/off-canvas/perk-redeem/perk-redeem.component';
import { GuardianProfileComponent } from './guardian/guardian-profile/guardian-profile.component';
import { GuardianHouseholdComponent } from './guardian/guardian-household/guardian-household.component';

@NgModule({
	declarations: [
		AppComponent,
		WardLandingComponent,
		GuardianLayoutComponent,
		GuardianSummaryComponent,
		CreateQuestComponent,
		SelectComponent,
		SelectComponentForm,
		ViewQuestComponent,
		EditQuestComponent,
		GuardianPerksComponent,
		CreatePerkComponent,
		PerkCardComponent,
		EditPerkComponent,
		PerkRedeemComponent,
		GuardianProfileComponent,
		GuardianHouseholdComponent,
  	],
  	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		ReactiveFormsModule,
		FormsModule,
		AngularFireModule.initializeApp(environment.firebase),
		AngularFireAuthModule,
		AngularFireDatabaseModule,
		StoreModule.forRoot({ guardian: guardianReducer, ward: wardReducer, error: apiErrorReducer, households: householdReducer}),
		StoreDevtoolsModule.instrument(),
		//Feature Modules
		AuthModule,
		AppRoutingModule,
	],
  	providers: [
		{ provide: PERSISTENCE, useValue: 'session' },
  	],
  	bootstrap: [AppComponent]
})
export class AppModule { }

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule, PERSISTENCE } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from 'src/environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Declarations
import { GuardianLayoutComponent } from './guardian/guardian-layout/guardian-layout.component';
import { WardLandingComponent } from './ward/ward-landing/ward-landing.component';
import { GuardianSummaryComponent } from './guardian/guardian-summary/guardian-summary.component';
import { CreateQuestComponent } from './components/modals/create-quest/create-quest.component';
import { SelectComponent } from './components/core/select/select.component';

// Store
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { apiErrorReducer } from 'src/store/api/api.store';
import { guardianReducer } from 'src/store/guardian/guardian.store';
import { wardReducer } from 'src/store/ward/ward.store';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { householdReducer } from 'src/store/household/household.store';

@NgModule({
  declarations: [
    AppComponent,
	WardLandingComponent,
	GuardianLayoutComponent,
	GuardianSummaryComponent,
	CreateQuestComponent,
	SelectComponent,
  ],
  imports: [
    BrowserModule,
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

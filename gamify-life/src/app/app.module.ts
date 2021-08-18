import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule, PERSISTENCE } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from 'src/environments/environment';
import { ReactiveFormsModule } from '@angular/forms';

// Declarations
import { AuthGuardianComponent } from './auth/auth-guardian/auth-guardian.component';
import { AuthWardComponent } from './auth/auth-ward/auth-ward.component';
import { GuardianLayoutComponent } from './guardian/guardian-layout/guardian-layout.component';
import { WardLandingComponent } from './ward/ward-landing/ward-landing.component';
import { GuardianSummaryComponent } from './guardian/guardian-summary/guardian-summary.component';

// Store
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { apiErrorReducer } from 'src/store/api/api.store';
import { guardianReducer } from 'src/store/guardian/guardian.store';
import { wardReducer } from 'src/store/ward/ward.store';

@NgModule({
  declarations: [
    AppComponent,
	AuthGuardianComponent,
	AuthWardComponent,
	WardLandingComponent,
	GuardianLayoutComponent,
	GuardianSummaryComponent
  ],
  imports: [
    BrowserModule,
	ReactiveFormsModule,
    AppRoutingModule,
	AngularFireModule.initializeApp(environment.firebase),
	AngularFireAuthModule,
	AngularFireDatabaseModule,
	StoreModule.forRoot({ guardian: guardianReducer, ward: wardReducer, error: apiErrorReducer}),
	StoreDevtoolsModule.instrument(),
  ],
  providers: [
		{ provide: PERSISTENCE, useValue: 'session' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

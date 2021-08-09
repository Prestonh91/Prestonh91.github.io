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

// Store
import { StoreModule } from '@ngrx/store';
import { userReducer } from 'src/store/user/user-auth.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { apiErrorReducer } from 'src/store/api/api.store';
import { WardLandingComponent } from './ward/ward-landing/ward-landing.component';

@NgModule({
  declarations: [
    AppComponent,
	AuthGuardianComponent,
	AuthWardComponent,
	WardLandingComponent,
  ],
  imports: [
    BrowserModule,
	ReactiveFormsModule,
    AppRoutingModule,
	AngularFireModule.initializeApp(environment.firebase),
	AngularFireAuthModule,
	AngularFireDatabaseModule,
	StoreModule.forRoot({ user: userReducer, error: apiErrorReducer}),
	StoreDevtoolsModule.instrument(),
  ],
  providers: [
		{ provide: PERSISTENCE, useValue: 'session' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

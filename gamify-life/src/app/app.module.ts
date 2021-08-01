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
import { AuthLandingComponent } from './auth/auth-landing/auth-landing.component';

// Store
import { StoreModule } from '@ngrx/store';
import { userReducer } from 'src/store/user/user-auth.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { apiErrorReducer } from 'src/store/api/api.store';

@NgModule({
  declarations: [
    AppComponent,
	AuthLandingComponent,
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

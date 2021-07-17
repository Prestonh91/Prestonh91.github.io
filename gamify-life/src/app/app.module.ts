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
  ],
  providers: [
		{ provide: PERSISTENCE, useValue: 'session' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { Component,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { LocalDbService } from './services/local-db.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, SideMenuComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {
  constructor(private localDb: LocalDbService) {}
  async ngOnInit() {
    await this.localDb.init();
    console.log('📦 Base de datos inicializada');
  }
}

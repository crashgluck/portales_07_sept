import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { listOutline, logInOutline, logOutOutline } from 'ionicons/icons';

addIcons({
  'list-outline': listOutline,
  'log-in-outline': logInOutline,
  'log-out-outline': logOutOutline
});


@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  standalone: true,
  imports:[IonicModule, RouterModule],
 
})
export class SideMenuComponent  implements OnInit {

  constructor(private autH:AuthService, private router: Router) { }

  ngOnInit() {
    
  }
  salir(){
    this.autH.logout()
    this.router.navigate(['/login']);
  }

}

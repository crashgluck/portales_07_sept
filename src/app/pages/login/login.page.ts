import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AnimationController } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginPage implements OnInit {
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastController: ToastController,
    private navCtrl: NavController,
    private animationCtrl: AnimationController
  ) {}

  ngOnInit() {
    this.playAnimation();
  }

  private playAnimation() {
    const el = document.querySelector('.mi-card');
    if (el) {
      this.animationCtrl.create()
        .addElement(el)
        .duration(4000)
        .iterations(Infinity)
        .keyframes([
          { offset: 0, transform: 'scale(1)', opacity: '1' },
          { offset: 0.25, transform: 'scale(1.1)', opacity: '0.9' },
          { offset: 0.5, transform: 'scale(0.95)', opacity: '0.95' },
          { offset: 0.75, transform: 'scale(1.05)', opacity: '1' },
          { offset: 1, transform: 'scale(1)', opacity: '1' },
        ])
        .play();
    }
  }

  async showToast(message: string, color: string = 'dark') {
  const toast = await this.toastController.create({
    message,
    duration: 3000,
    color,
    position: 'bottom'
  });
  toast.present();
}


  onSubmit() {
    if (this.form.invalid) {
      this.showToast('Formulario inválido. Revisa los campos.', 'warning');
      return;
    }

    const { username, password } = this.form.value;

    if (!username || !password) {
      this.showToast('Debes ingresar usuario y contraseña', 'warning');
      return;
    }

    this.authService.login(username, password).subscribe({
      next: () => {
        this.showToast('Inicio de sesión exitoso', 'success');
        this.navCtrl.navigateRoot('/registro-acceso');
      },
      error: (error) => {
        if (!navigator.onLine || error.status === 0) {
          this.showToast('No se pudo conectar al servidor', 'danger');
        } else if (error.status === 400 || error.status === 401) {
          this.showToast('Usuario o contraseña incorrectos', 'warning');
        } else {
          this.showToast('Error inesperado al iniciar sesión', 'danger');
        }
        console.error('Login error:', error);
      }
    });
  }
}

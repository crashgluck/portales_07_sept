import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { RegistroAccesoService, RegistroAcceso } from '../../services/registrar-acceso.service';
import { UsuarioNuevoService, UsuarioNuevo } from '../../services/usuario-nuevo.service';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Subscription, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-registro-acceso',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './registro-acceso.page.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RegistroAccesoPage implements OnInit, OnDestroy {
  registros: RegistroAcceso[] = [];
  registrosFiltrados: RegistroAcceso[] = [];
  parcelas: UsuarioNuevo[] = [];
  parcelasFiltradas: UsuarioNuevo[] = [];
  form: FormGroup;
  busquedaControl: FormControl;
  mostrarEmpresa = false;
  editando = false;
  idEditar: number | null = null;

  private subscriptions: Subscription[] = [];

  motivosAgrupados = [
    {
      categoria: 'Visitas',
      opciones: [
        { valor: 'PROPIETARIO', texto: 'Propietario' },
        { valor: 'VISITA', texto: 'Visita' }
      ]
    },
    {
      categoria: 'Servicios',
      opciones: [
        { valor: 'EMPRESA', texto: 'Empresa' },
        { valor: 'SERVICIO', texto: 'Servicio' }
      ]
    },
    {
      categoria: 'Emergencias',
      opciones: [
        { valor: 'CARABINEROS', texto: 'Carabineros' },
        { valor: 'BOMBEROS', texto: 'Bomberos' },
        { valor: 'AMBULANCIA', texto: 'Ambulancia' },
        { valor: 'PDI', texto: 'PDI' }
      ]
    }
  ];

  constructor(
    private fb: FormBuilder,
    private registroService: RegistroAccesoService,
    private usuarioNuevoService: UsuarioNuevoService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    const ahora = new Date();
    const isoLocal = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString();

    this.form = this.fb.group({
      RUT: ['', [Validators.required, rutValidator()]],
      parcela: ['', Validators.required],
      patente: ['', Validators.required],
      motivo: ['', Validators.required],
      nombre_empresa: [''],
      fecha_hora: [isoLocal, Validators.required],
      nota: [''],
      numero_tarjeton: [''],
      color_tarjeton: ['']
    });

    this.busquedaControl = this.fb.control('');
  }

  // -------------------------
  // Hooks
  // -------------------------
  ngOnInit() {
    this.configurarFormControls();
    this.cargarParcelas();
  }

  ionViewWillEnter() {
  // Actualiza fecha_hora cada vez que entras a la página
  const ahora = new Date();
  const isoLocal = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString();
  this.form.get('fecha_hora')?.setValue(isoLocal);

  // Cargar registros actualizados
  this.cargarRegistros();
}


  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // -------------------------
  // Configuración de form controls
  // -------------------------
  private configurarFormControls() {
    // Filtrar parcelas mientras se escribe
    const sub1 = this.busquedaControl.valueChanges.subscribe(texto => this.filtrarParcelas(texto));
    this.subscriptions.push(sub1);

    // Mostrar u ocultar campo nombre_empresa según motivo
    const sub2 = this.form.get('motivo')?.valueChanges.subscribe(valor => {
      if (valor === 'EMPRESA' || valor === 'SERVICIO') {
        this.mostrarEmpresa = true;
        this.form.get('nombre_empresa')?.setValidators(Validators.required);
      } else {
        this.mostrarEmpresa = false;
        this.form.get('nombre_empresa')?.clearValidators();
      }
      this.form.get('nombre_empresa')?.updateValueAndValidity();
    });
    if (sub2) this.subscriptions.push(sub2);
  }

  // -------------------------
  // Métodos async para cargar datos
  // -------------------------
  private async cargarParcelas() {
    try {
      const data = await firstValueFrom(this.usuarioNuevoService.getParcelas());
      this.parcelas = data;
    } catch (err) {
      console.error('Error cargando parcelas:', err);
      this.mostrarToast('Error cargando parcelas', 'danger');
    }
  }

  private async cargarRegistros() {
    try {
      const data = await firstValueFrom(this.registroService.getRegistros());
      this.registros = data.results;
      this.registrosFiltrados = data.results;
    } catch (err) {
      console.error('Error cargando registros:', err);
      this.mostrarToast('Error cargando registros', 'danger');
    }
  }

  // -------------------------
  // Filtrado y selección
  // -------------------------
  filtrarParcelas(texto: string) {
    if (!texto) {
      this.parcelasFiltradas = [];
      return;
    }
    const t = texto.toLowerCase();
    this.parcelasFiltradas = this.parcelas.filter(p => {
      const parcelaCompleta = `${p.lote}-${p.n_lote}`.toLowerCase();
      return parcelaCompleta.includes(t) || p.first_name.toLowerCase().includes(t);
    });
  }

  seleccionarParcela(p: UsuarioNuevo) {
    this.form.get('parcela')?.setValue(p.id);
    this.busquedaControl.setValue(`${p.lote}-${p.n_lote} (${p.first_name})`, { emitEvent: false });
    this.parcelasFiltradas = [];
  }

  // -------------------------
  // Formato y envío
  // -------------------------
  formatearRut() {
    let rut = this.form.get('RUT')?.value || '';
    rut = rut.replace(/[^0-9kK]/g, '');
    if (rut.length > 1) {
      const cuerpo = rut.slice(0, -1);
      const dv = rut.slice(-1);
      this.form.get('RUT')?.setValue(`${cuerpo}-${dv.toUpperCase()}`);
    }
  }

  async enviar() {
    const loading = await this.loadingCtrl.create({ message: 'Guardando registro...', spinner: 'circles' });
    await loading.present();

    const data = { ...this.form.value };
    if (data.motivo === 'PROPIETARIO') {
      data.numero_tarjeton = null;
      data.color_tarjeton = null;
    }

    try {
      if (this.editando && this.idEditar !== null) {
        await firstValueFrom(this.registroService.updateRegistro(this.idEditar, data));
        this.mostrarToast('Registro actualizado correctamente');
      } else {
        await firstValueFrom(this.registroService.createRegistro(data));
        this.mostrarToast('Registro creado correctamente');
      }
      this.resetFormulario();
      this.cargarRegistros();
    } catch (err) {
      console.error(err);
      this.mostrarToast('Error al guardar el registro', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  resetFormulario() {
    const ahora = new Date();
    const isoLocal = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString();
    this.form.reset({
      fecha_hora: isoLocal,
      RUT: '',
      parcela: '',
      patente: '',
      motivo: '',
      nombre_empresa: '',
      nota: '',
      numero_tarjeton: '',
      color_tarjeton: ''
    });
    this.editando = false;
    this.idEditar = null;
    this.busquedaControl.setValue('');
  }

  editar(registro: RegistroAcceso) {
    this.form.patchValue(registro);
    this.editando = true;
    this.idEditar = registro.id || null;
  }

  eliminar(id: number) {
    this.registroService.deleteRegistro(id).subscribe(() => this.cargarRegistros());
  }

  // -------------------------
  // Toast helper
  // -------------------------
  async mostrarToast(mensaje: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 2000, color, position: 'top' });
    toast.present();
  }
}

export function rutValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rut = control.value;
    const rutRegex = /^\d{7,8}-[\dkK]$/;
    return rutRegex.test(rut) ? null : { rutInvalido: true };
  };
}

import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { RegistroAccesoService, RegistroAcceso } from '../../services/registrar-acceso.service';
import { UsuarioNuevoService, UsuarioNuevo } from '../../services/usuario-nuevo.service';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-registro-acceso',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './registro-acceso.page.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RegistroAccesoPage implements OnInit {
  registros: RegistroAcceso[] = [];
  registrosFiltrados: RegistroAcceso[] = [];
  parcelas: UsuarioNuevo[] = [];
  parcelasFiltradas: UsuarioNuevo[] = [];
  form: FormGroup;
  busquedaControl: FormControl;
  mostrarEmpresa: boolean = false;
  editando = false;
  idEditar: number | null = null;

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
    private loadingCtrl: LoadingController // 👈 agregado
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

  ngOnInit() {
    this.cargarRegistros();
    this.cargarParcelas();

    this.busquedaControl.valueChanges.subscribe(texto => this.filtrarParcelas(texto));

    this.form.get('motivo')?.valueChanges.subscribe(valor => {
      if (valor === 'EMPRESA' || valor === 'SERVICIO') {
        this.mostrarEmpresa = true;
        this.form.get('nombre_empresa')?.setValidators(Validators.required);
      } else {
        this.mostrarEmpresa = false;
        this.form.get('nombre_empresa')?.clearValidators();
      }
      this.form.get('nombre_empresa')?.updateValueAndValidity();
    });
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }

  cargarRegistros() {
    this.registroService.getRegistros().subscribe({
      next: data => {
        this.registros = data.results;
        this.registrosFiltrados = data.results;
      },
      error: err => console.error(err)
    });
  }

  cargarParcelas() {
    this.usuarioNuevoService.getParcelas().subscribe(data => {
      this.parcelas = data;
    });
  }

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
    const loading = await this.loadingCtrl.create({
      message: 'Guardando registro...',
      spinner: 'circles'
    });
    await loading.present();

    const data = { ...this.form.value };

    if (data.motivo === 'PROPIETARIO') {
      data.numero_tarjeton = null;
      data.color_tarjeton = null;
    }

    const obs = this.editando && this.idEditar !== null
      ? this.registroService.updateRegistro(this.idEditar, data)
      : this.registroService.createRegistro(data);

    obs.subscribe({
      next: async () => {
        await loading.dismiss();
        this.cargarRegistros();
        this.resetFormulario();
        this.mostrarToast(this.editando ? 'Registro actualizado correctamente' : 'Registro creado correctamente');
      },
      error: async err => {
        console.error(err);
        await loading.dismiss();
        this.mostrarToast('Error al guardar el registro', 'danger');
      }
    });
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
    this.registroService.deleteRegistro(id).subscribe(() => {
      this.cargarRegistros();
    });
  }
}

export function rutValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rut = control.value;
    const rutRegex = /^\d{7,8}-[\dkK]$/;
    return rutRegex.test(rut) ? null : { rutInvalido: true };
  };
}

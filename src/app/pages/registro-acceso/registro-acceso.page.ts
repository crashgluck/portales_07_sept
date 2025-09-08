import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RegistroAccesoService, RegistroAcceso } from '../../services/registrar-acceso.service';
import { UsuarioNuevoService, UsuarioNuevo } from '../../services/usuario-nuevo.service'; // NUEVO servicio
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AnimationController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
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
  registrosFiltrados: RegistroAcceso[] = []; // ✅ agregar
  parcelas: UsuarioNuevo[] = [];  // lista de parcelas desde el backend
  form: FormGroup;
  mostrarEmpresa: boolean = false;
  editando = false;
  idEditar: number | null = null;
  
  currentPage = 1;
  totalPages = 1;

  cargando = false;
  motivosAgrupados = [
  {
    categoria: 'Visitas',
    opciones: [
      { valor: 'PROPIETARIO', texto: 'Propietario' },
      { valor: 'VISITA', texto: 'Visita' },
    ]
  },
  {
    categoria: 'Servicios',
    opciones: [
      { valor: 'EMPRESA', texto: 'Empresa' },
      { valor: 'SERVICIO', texto: 'Servicio' },
    ]
  },
  {
    categoria: 'Emergencias',
    opciones: [
      { valor: 'CARABINEROS', texto: 'Carabineros' },
      { valor: 'BOMBEROS', texto: 'Bomberos' },
      { valor: 'AMBULANCIA', texto: 'Ambulancia' },
      { valor: 'PDI', texto: 'PDI' },
    ]
  }
];


  constructor(
    private fb: FormBuilder,
    private registroService: RegistroAccesoService,
    private usuarioNuevoService: UsuarioNuevoService, // servicio para traer parcelas
    private animationCtrl: AnimationController,
    private toastCtrl: ToastController // ✅
  ) {
    const ahora = new Date();
    const isoLocal = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString();

    this.form = this.fb.group({
      RUT: ['', [Validators.required, rutValidator()]], // ✅ RUT validado
      parcela: ['', Validators.required],  // ✅ reemplaza lote y numero_lote
      patente: ['', Validators.required],
      motivo: ['', Validators.required],
      nombre_empresa: [''],
      fecha_hora: [isoLocal, Validators.required],
      nota: [''],
      numero_tarjeton: [''], // inicializado como string
      color_tarjeton: [''], 
    });
  }

  ngOnInit() {
    this.cargarRegistros();
    this.cargarParcelas(); // ✅ cargar parcelas al inicio
/*
    const animation = this.animationCtrl
      .create()
      .addElement(document.querySelector('.mi-card')!)
      .addElement(document.querySelector('.logo')!)
      .duration(800)
      .fromTo('opacity', '0', '1')
      .fromTo('transform', 'translateY(20px)', 'translateY(0px)')
      .play();
      */

    this.form.get('motivo')?.valueChanges.subscribe(valor => {
      if (valor === 'empresa' || valor === 'servicio') {
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
    color: color,
    position: 'top'
  });
  toast.present();
}



  cargarRegistros(page: number = 1) {
  this.cargando = true;
  this.registroService.getRegistros(page).subscribe({
    next: (data) => {
      // data es PaginatedResponse<RegistroAcceso>
      this.registros = data.results;          // ✅ solo los registros
      this.registrosFiltrados = data.results; // ✅ para búsqueda/filtrado
      this.totalPages = Math.ceil(data.count / 10);
      this.currentPage = page;
      this.cargando = false;
    },
    error: (err) => {
      console.error(err);
      this.cargando = false;
    }
  });
}



siguientePagina() {
  if (this.currentPage < this.totalPages) {
    this.cargarRegistros(this.currentPage + 1);
  }
}

paginaAnterior() {
  if (this.currentPage > 1) {
    this.cargarRegistros(this.currentPage - 1);
  }
}

  cargarParcelas() {
    this.usuarioNuevoService.getParcelas().subscribe(data => {
      this.parcelas = data;
      console.log(this.parcelas)
    });
  }

  enviar() {
  const data = this.form.value;
  // Asegurarse de que tarjetón sea null si motivo es PROPIETARIO
  if (data.motivo === 'PROPIETARIO') {
    data.numero_tarjeton = null;
    data.color_tarjeton = null;
  }

  if (this.editando && this.idEditar !== null) {
    this.registroService.updateRegistro(this.idEditar, data).subscribe({
      next: () => {
        this.cargarRegistros();
        this.resetFormulario(); // ✅ reset con fecha nueva
        this.mostrarToast('Registro actualizado correctamente', 'success');
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Error al actualizar. Verifica tu conexión.', 'danger');
      }
    });
  } else {
    this.registroService.createRegistro(data).subscribe({
      next: () => {
        this.cargarRegistros();
        this.resetFormulario(); // ✅ reset con fecha nueva
        this.mostrarToast('Registro creado correctamente', 'success');
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Error al crear registro. Verifica tu conexión.', 'danger');
      }
    });
  }
}

// función para resetear formulario
resetFormulario() {
  const ahora = new Date();
  const isoLocal = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000).toISOString();
  
  this.form.reset({
    fecha_hora: isoLocal,  // ✅ valor por defecto actualizado
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

  cancelar() {
    this.form.reset();
    this.editando = false;
    this.idEditar = null;
  }
}

export function rutValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rut = control.value;
    // Formato 12345678-9 o 12.345.678-9
    const rutRegex = /^\d{7,8}-[\dkK]$/;
    return rutRegex.test(rut) ? null : { rutInvalido: true };
  };
}

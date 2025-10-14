import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RegistroAccesoService, RegistroAcceso, PaginatedResponse } from 'src/app/services/registrar-acceso.service';
import { UsuarioNuevoService, UsuarioNuevo } from 'src/app/services/usuario-nuevo.service';
import { CommonModule } from '@angular/common';
import { IonicModule, AnimationController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro-list',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  templateUrl: './registro-list.page.html',
  styleUrls: ['./registro-list.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RegistroListPage implements OnInit {

  registros: RegistroAcceso[] = [];
  registrosFiltrados: RegistroAcceso[] = [];
  parcelas: UsuarioNuevo[] = [];
  parcelasMap: { [key: number]: string } = {};
  searchTerm: string = '';
  cargando = false;

  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    private registroService: RegistroAccesoService,
    private animationCtrl: AnimationController,
    private usuarioNuevoService: UsuarioNuevoService
  ) {}

  ngOnInit() {
    this.cargarParcelas();
    this.cargarRegistros();

    this.animationCtrl
      .create()
      .addElement(document.querySelector('.mi-card')!)
      .duration(850)
      .fromTo('opacity', '0', '1')
      .fromTo('transform', 'translateY(20px)', 'translateY(0px)')
      .play();
  }

  ionViewWillEnter() {
    this.cargarRegistros(); // se llama cada vez que la página aparece
  }

  cargarParcelas() {
  this.usuarioNuevoService.getParcelas().subscribe(data => {
    this.parcelas = data;
    this.parcelasMap = {};
    data.forEach(p => {
      this.parcelasMap[p.id] = `${p.lote} - ${p.n_lote}`; // <-- con espacio alrededor de -
    });
  });
}


  cargarRegistros(page: number = 1) {
    this.cargando = true;
    this.registroService.getRegistros(page, this.searchTerm).subscribe({
      next: (data: PaginatedResponse<RegistroAcceso>) => {
        this.registros = data.results;
        this.registrosFiltrados = data.results;
        this.totalPages = Math.ceil(data.count / 10); // page_size del backend
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

  filtrarRegistros() {
  const term = this.searchTerm.toLowerCase().trim().replace(/\s*-\s*/, '-'); 
  // Normaliza term: quita espacios antes y después del guion

  if (!term) {
    this.registrosFiltrados = this.registros;
    return;
  }

  this.registrosFiltrados = this.registros.filter(reg => {
    // Normaliza el texto de la parcela de la misma forma
    const parcelaTexto = (this.parcelasMap[reg.parcela] || '').toLowerCase().replace(/\s*-\s*/, '-');
    const rut = reg.RUT?.toLowerCase() || '';
    const patente = reg.patente?.toLowerCase() || '';
    const motivo = reg.motivo?.toLowerCase() || '';
    const empresa = reg.nombre_empresa?.toLowerCase() || '';

    return (
      parcelaTexto.includes(term) ||
      rut.includes(term) ||
      patente.includes(term) ||
      motivo.includes(term) ||
      empresa.includes(term)
    );
  });

  this.currentPage = 1; // Reinicia la paginación al filtrar
}



  refrescar(event: any) {
    this.cargarRegistros(this.currentPage);
    event.target.complete();
  }

}

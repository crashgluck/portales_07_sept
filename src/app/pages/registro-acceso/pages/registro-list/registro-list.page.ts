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
    FormsModule
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

  cargarParcelas() {
    this.usuarioNuevoService.getParcelas().subscribe(data => {
      this.parcelas = data;
      this.parcelasMap = {};
      data.forEach(p => {
        this.parcelasMap[p.id] = `${p.lote}-${p.n_lote}`;
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
    // Cada vez que se cambia el término de búsqueda, reinicia la página
    this.cargarRegistros(1);
  }

  refrescar(event: any) {
    this.cargarRegistros(this.currentPage);
    event.target.complete();
  }

}

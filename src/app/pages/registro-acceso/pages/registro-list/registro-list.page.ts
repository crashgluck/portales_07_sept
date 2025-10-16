import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RegistroAccesoService, RegistroAcceso, PaginatedResponse } from 'src/app/services/registrar-acceso.service';
import { UsuarioNuevoService, UsuarioNuevo } from 'src/app/services/usuario-nuevo.service';
import { CommonModule } from '@angular/common';
import { IonicModule, AnimationController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { firstValueFrom } from 'rxjs';


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
export class RegistroListPage implements OnInit, OnDestroy {
  // Variables
  registros: RegistroAcceso[] = [];
  registrosFiltrados: RegistroAcceso[] = [];
  parcelas: UsuarioNuevo[] = [];
  parcelasMap: { [key: number]: string } = {};
  searchTerm: string = '';
  cargando = false;

  currentPage: number = 1;
  totalPages: number = 1;

  // Para manejar suscripciones futuras
  private subscriptions: Subscription[] = [];

  constructor(
    private registroService: RegistroAccesoService,
    private animationCtrl: AnimationController,
    private usuarioNuevoService: UsuarioNuevoService
  ) {}

  // -------------------------
  // Hooks
  // -------------------------
  ngOnInit() {
    this.cargarParcelas();
    this.reproducirAnimacion();
  }

  ionViewWillEnter() {
    this.cargarRegistros(); // se llama cada vez que la página aparece
  }

  ngOnDestroy() {
    // Limpia suscripciones si agregas Observables sin completar en el futuro
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // -------------------------
  // Métodos de carga
  // -------------------------
  private async cargarParcelas() {
  try {
    const data = await firstValueFrom(this.usuarioNuevoService.getParcelas());
    this.parcelas = data;
    this.parcelasMap = {};
    data.forEach(p => {
      this.parcelasMap[p.id] = `${p.lote} - ${p.n_lote}`;
    });
  } catch (err) {
    console.error('Error cargando parcelas:', err);
  }
}

async cargarRegistros(page: number = 1) {
  this.cargando = true;
  try {
    const data: PaginatedResponse<RegistroAcceso> = await firstValueFrom(
      this.registroService.getRegistros(page, this.searchTerm)
    );

    this.registros = data.results;
    this.registrosFiltrados = data.results;
    this.totalPages = Math.ceil(data.count / 10);
    this.currentPage = page;
  } catch (err) {
    console.error('Error cargando registros:', err);
  } finally {
    this.cargando = false;
  }
}


  // -------------------------
  // Paginación
  // -------------------------
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

  // -------------------------
  // Filtrado
  // -------------------------
  filtrarRegistros() {
    const term = this.searchTerm.toLowerCase().trim().replace(/\s*-\s*/, '-');

    if (!term) {
      this.registrosFiltrados = this.registros;
      return;
    }

    this.registrosFiltrados = this.registros.filter(reg => {
      const parcelaTexto = (this.parcelasMap[reg.parcela] || '')
        .toLowerCase()
        .replace(/\s*-\s*/, '-');

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

    this.currentPage = 1; // Reinicia paginación al filtrar
  }

  // -------------------------
  // Refrescar
  // -------------------------
  refrescar(event: any) {
    this.cargarRegistros(this.currentPage);
    event.target.complete();
  }

  // -------------------------
  // Animación
  // -------------------------
  private reproducirAnimacion() {
    this.animationCtrl
      .create()
      .addElement(document.querySelector('.mi-card')!)
      .duration(850)
      .fromTo('opacity', '0', '1')
      .fromTo('transform', 'translateY(20px)', 'translateY(0px)')
      .play();
  }
}

// src/app/services/local-db.service.ts
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { RegistroAcceso } from './registrar-acceso.service';

@Injectable({ providedIn: 'root' })
export class LocalDbService {
  private db!: SQLiteObject;

  constructor(private sqlite: SQLite) {}

  async init() {
    this.db = await this.sqlite.create({
      name: 'registros.db',
      location: 'default'
    });

    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS registros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        RUT TEXT,
        nombre_completo TEXT,
        parcela INTEGER,
        patente TEXT,
        vehiculo TEXT,
        motivo TEXT,
        nombre_empresa TEXT,
        fecha_hora TEXT,
        nota TEXT,
        synced INTEGER DEFAULT 0
      )
    `, []);
  }

  async addRegistro(registro: RegistroAcceso) {
    await this.db.executeSql(`
      INSERT INTO registros 
      (RUT, nombre_completo, parcela, patente, vehiculo, motivo, nombre_empresa, fecha_hora, nota, synced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `, [
      registro.RUT,
      registro.nombre_completo,
      registro.parcela,
      registro.patente,
      registro.vehiculo,
      registro.motivo,
      registro.nombre_empresa ?? null,
      registro.fecha_hora,
      registro.nota
    ]);
  }

  async getPendientes() {
    const res = await this.db.executeSql('SELECT * FROM registros WHERE synced = 0', []);
    return Array.from({ length: res.rows.length }, (_, i) => res.rows.item(i));
  }

  async marcarComoSincronizado(id: number) {
    await this.db.executeSql('UPDATE registros SET synced = 1 WHERE id = ?', [id]);
  }
}

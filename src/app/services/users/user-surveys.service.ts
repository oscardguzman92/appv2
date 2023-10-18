import { Config } from 'src/app/enums/config.enum';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class UserSurveysService {

  public surveysStorage: Array<any> = [];

  constructor(
    private storage: Storage,
  ) { }

  setSurveysStorage(data) {
    if (!this.surveysStorage) this.surveysStorage = [];
    this.surveysStorage.push(data);
    this.storage.set("surveysStorage", this.surveysStorage);
  }

  updateSurveysStorage(data) {
    this.surveysStorage = data;
    this.storage.set("surveysStorage", data);
  }

  async getSurveysPendStorage() {
    this.surveysStorage = await this.storage.get("surveysStorage") || [];
  }

  async getSurveyStorageList() {
    let datosSinConexion = await this.storage.get(Config.nombre_archivo_encuestas_offline);
    const service = datosSinConexion;
    if (service && service.encuestas) {
      return service.encuestas;
    }
    return;
  }
  
  async setSurveyStorageList(encuestas) {
    let datosSinConexion = await this.storage.get(Config.nombre_archivo_encuestas_offline);
    const service = datosSinConexion;
    service.encuestas = encuestas;
    //this.storage.set(Config.nombre_archivo_encuestas_offline, service)
  }

  async getDepartamentsStorageList() {
    let datosSinConexion = await this.storage.get(Config.nombre_archivo_encuestas_offline);
    const service = datosSinConexion;
    if (service && service.departamentos) {
      return service.departamentos;
    }
    return;
  }

  async getCitiesStorageList(depto_id) {
    let datosSinConexion = await this.storage.get(Config.nombre_archivo_encuestas_offline);
    const service = datosSinConexion;
    if (service && service.ciudades) {
      return service.ciudades.filter( city => city.departamento_id == depto_id);
    }
    return;
  }
  
}

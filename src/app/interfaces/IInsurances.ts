export interface IInsurances {
  id: number;
  activo: boolean;
  visible_app: boolean;
  nombre: string;
  image: string;
  description: IInsurancesDescription;
  descripcion: any;
  prima: number;
  prima_puntos?: number;
  selected: boolean;
  slug: string;
  seguro_id?: number;
  cliente_id?: number;
  num_id?: string;
  fecha_nacimiento?: string;
  genero?: string;
  celular?: string;
  correo?: string;
  estado_civil?: string;
  departamento_id?: string;
  ciudad_id?: string;
  token?: string;
}

export interface IInsurancesDescription {
    id: number;
    html: string;
    copy: string;
}


export interface IInsurancesDepartament {
    id: number;
    nombre: string;
    ciudades?:[
        {
            id:number;
            ciudad:string;
            seguro_departamento_id:number;
        }
    ]

}

export interface IInsurancesCity {
    id: number;
    name: string;
}

export interface IInsurancesMartial {
    id: number;
    name: string;
}

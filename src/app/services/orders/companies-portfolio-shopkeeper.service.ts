import {Injectable} from '@angular/core';
import { TypeKart } from 'src/app/enums/typeKart.enum';
import { ICompaniesPortfolios } from 'src/app/interfaces/ICompaniesPortfolios';
import {ICompany} from 'src/app/interfaces/ICompany';
import {IPortfolio} from 'src/app/interfaces/IPortfolio';

@Injectable({
    providedIn: 'root'
})
export class CompaniesPortfolioShopkeeperService {
    dataRes: {
        companias: ICompany[];
        portafolios: IPortfolio[];
        productos_destacados: any[];
        res: any;
    } = {
        companias: [],
        portafolios: [],
        productos_destacados: [],
        res: null
    };
    portfolio: any;
    constructor() {
    }

    setCompaniesPortfolios(res) {
        this.dataRes = {
            companias: [],
            portafolios: [],
            productos_destacados: [],
            res: null
        };

        this.dataRes.res = res;
        let indexPortafolioXXX, indexCompaniaXXX;
        for (const portafolio in res.portafolios) {
            if (res.portafolios[portafolio].vendedor_id == 'xxx') {
                indexPortafolioXXX = Number(portafolio);
                break;
            }
        }

        for (const compania in res.companias) {
            if (res.companias[compania].portafolio == 'xxx') {
                indexCompaniaXXX = Number(compania);
                break;
            }
        }

        res.companias.forEach(company => {
            company.image =
                '/assets/images/logos-companias/logo-' +
                this.cleanImgCompany(company.nombre) +
                '-color.jpg';
            if (company.portafolio == 'xxx') {
                company.portafolio = indexPortafolioXXX;
            }
            if (
                res.portafolios[company.portafolio] &&
                company.vista_portafolio
            ) {
                if (!res.portafolios[company.portafolio].companies) {
                    res.portafolios[company.portafolio].companies = [];
                }
                res.portafolios[company.portafolio].companies.push(company);
                res.portafolios[company.portafolio].nom_dist = company.nom_dist;
                res.portafolios[company.portafolio].image =
                    '/assets/images/logos-companias/logo-' +
                    this.cleanImgCompany(company.nom_dist) +
                    '-color.jpg';
            } else {
                if (!this.companyExists(this.dataRes.companias, company)) {
                    this.dataRes.companias.push(company);
                }
            }
        });
        let iPortfolio = 0;
        for (const portafolio in res.portafolios) {
            if (
                res.portafolios[portafolio].companies &&
                res.portafolios[portafolio].companies.length > 0
            ) {
                if (res.portafolios[portafolio].distribuidor_id == 'xxx') {
                    res.portafolios[portafolio].distribuidor_id =
                        res.companias[indexCompaniaXXX].distribuidor_id;
                }
                iPortfolio++;
                res.portafolios[portafolio].index = iPortfolio;
                res.portafolios[portafolio].portafolio = res.portafolios[portafolio].vendedor_id;
                this.dataRes.portafolios.push(res.portafolios[portafolio]);
            }
        }
        this.dataRes.productos_destacados = res.productos_destacados;
    }

    divideCompaniesPortfolio(companies) {
        let companiesRows = [];
        if (companies.length <= 3) { // retorna solo una fila con compañías
            companies.forEach((company, index) => {
                if (!companiesRows[index]) {
                    companiesRows[index] = [];
                }
                companiesRows[index].push(company);
            });
        } else { // retorna en dos filas con compañías
            let i = 0;
            companies.forEach((company, index) => {
                if (!companiesRows[i]) {
                    companiesRows[i] = [];
                }
                companiesRows[i].push(company);
                if (index % 2) {
                    i++;
                }
            });
        }
        return companiesRows;
    }

    shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    filterCompaniesPortfolios(portfolioIn, companies = []) {
        let uniqueDealers = [];
        let portfolios = Object.assign([], portfolioIn);
        portfolios.forEach(p => {
            p.companies = this.shuffle(p.companies);
            p.companiesRows = this.divideCompaniesPortfolio(p.companies);
        });
        let tempCompaniesPorfolios: ICompaniesPortfolios[] = [];
        if (companies && companies.length > 0) {
            companies.forEach(c => {
                tempCompaniesPorfolios.push(
                    {
                        type: TypeKart.company,
                        company: c,
                        order: c.order,
                    }
                );
            });
        }
        portfolios.forEach(p => {
            let compPortFind = tempCompaniesPorfolios.find(e => e.type == TypeKart.portfolio && e.portfolio.portafolio == e.portfolio.portafolio);
            let order = (compPortFind) ? compPortFind.portfolio.companies[0].order : p.companies[0].order;
            // validar que es vista unica
            if (p.vista_unica && p.distribuidor_id) {
                if (uniqueDealers.includes(p.distribuidor_id)) {
                    let companyTmp = null;
                    for (let i = 0; i < tempCompaniesPorfolios.length; i++) {
                        if (tempCompaniesPorfolios[i].portfolio && p.distribuidor_id == tempCompaniesPorfolios[i].portfolio.distribuidor_id) {
                            companyTmp = tempCompaniesPorfolios[i];
                            break;
                        }
                    }
    
                    if (companyTmp != null) {
                        for (let j = 0; j < p.companies.length; j++) {
                            console.log("aqui",p)
                            const compa = p.companies[j];
                            const comparow = (p.companiesRows[j]) ? p.companiesRows[j] : null;
    
                            const validate = companyTmp.portfolio.companies.find(company => company.id == compa.id);
                            if (!validate) {
                                companyTmp.portfolio.companies.push(compa);
                                if (comparow != null) {
                                    companyTmp.portfolio.companiesRows.push(comparow);
                                }
                            }
                        }
                    }
    
                } else if (p.distribuidor_id) {
                    uniqueDealers.push(p.distribuidor_id);
                    tempCompaniesPorfolios.push(
                        {
                            type: TypeKart.portfolio,
                            portfolio: p,
                            order: order,
                        }
                    );
                }
            } else {
                tempCompaniesPorfolios.push(
                    {
                        type: TypeKart.portfolio,
                        portfolio: p,
                        order: order,
                    }
                );
            }
        });
        tempCompaniesPorfolios.sort((a, b) => (a.order > b.order || (a.type == TypeKart.portfolio && b.type == TypeKart.portfolio && a.portfolio.index > b.portfolio.index)) ? 1 : -1);
        return tempCompaniesPorfolios;
    }

    getCompaniesPortfolios() {
        return this.dataRes;
    }

    setPortfolio(idPortfolio) {
        this.portfolio = idPortfolio;
    }

    getPortfolio() {
        return this.portfolio;
    }

    searchInPortfolio(company_id: number) {
        let res;
        let portfolios:any = Object.assign([], this.dataRes.portafolios);
        portfolios = this.filterCompaniesPortfolios(portfolios);
        console.log(portfolios);
        if (portfolios.length > 0) {
            portfolios.forEach(portfolio => {
                if (portfolio.portfolio.companies.some(e => e.id == company_id)) {
                    res = portfolio.portfolio;
                    return;
                }
            });
        }
        return res;
    }

    searchByPortfolio(portfolioId) {
        return this.dataRes.portafolios.find(p => p.portafolio == portfolioId);
    }

    private companyExists(companies: any[], company: any): boolean {
        let i = 0;

        for (const companyObj of companies) {
            if (companyObj.id === company.id) {
                if (
                    companyObj.puntos && company.puntos && 
                    companyObj.puntos.puntaje_asignar <
                    company.puntos.puntaje_asignar
                ) {
                    this.dataRes.companias[i] = company;
                }
                return true;
            }

            i++;
        }
        return false;
    }

    public cleanImgCompany(cadena) {
        // Definimos los caracteres que queremos eliminar
        const specialChars = '!@#$^&%*()+=-[]/{}|:<>?,.';

        // Los eliminamos todos
        for (let i = 0; i < specialChars.length; i++) {
            cadena = cadena.replace(
                new RegExp('\\' + specialChars[i], 'gi'),
                ''
            );
        }

        // Lo queremos devolver limpio en minusculas
        cadena = cadena.toLowerCase();

        // Quitamos espacios y los sustituimos por _ porque nos gusta mas asi
        cadena = cadena.replace(/ /g, '-');

        // Quitamos acentos y "ñ". Fijate en que va sin comillas el primer parametro
        cadena = cadena.replace(/á/gi, 'a');
        cadena = cadena.replace(/é/gi, 'e');
        cadena = cadena.replace(/í/gi, 'i');
        cadena = cadena.replace(/ó/gi, 'o');
        cadena = cadena.replace(/ú/gi, 'u');
        cadena = cadena.replace(/ñ/gi, 'n');
        return cadena;
    }
}

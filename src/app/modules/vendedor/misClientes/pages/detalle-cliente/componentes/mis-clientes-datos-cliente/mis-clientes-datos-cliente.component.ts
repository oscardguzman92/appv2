import {Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import { CashRegisterService } from 'src/app/services/orders/cash-register.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { SuperSellerService } from 'src/app/services/users/super-seller.service';


@Component({
    selector: 'app-mis-clientes-datos-cliente',
    templateUrl: './mis-clientes-datos-cliente.component.html',
    styleUrls: ['./mis-clientes-datos-cliente.component.scss'],
})
export class MisClientesDatosClienteComponent implements OnInit {

    @ViewChild('myInput') myInput: ElementRef;
    @Input() direction: string;
    @Input() cellphone: string;
    @Input() visitDay: string;
    @Input() name: string;
    @Input() document: string;
    @Input() orden: string;
    @Input() shopId: string;
    public prevOrden = "0";
    public todo: FormGroup;
    public isEdit: boolean = false;
    constructor(private cashregister: CashRegisterService, private formBuilder: FormBuilder, 
        private toastCtrl: ToastController,
        public superSellerService: SuperSellerService,
        private storage: Storage) {
        this.todo = this.formBuilder.group({
            valor: [],
        });
    }
    
    ngOnInit() {
        //this.reorderStoresPosition();
        if (this.orden){
            this.prevOrden = this.orden ;
            this.todo.patchValue({ valor: this.orden })
            console.log(this.todo);
            console.log(this.orden);
        }else{
            this.todo = this.formBuilder.group({
                value: [0],
            });

        }
    }

    activeInput() {
        if (this.isEdit === true) {
            
            return;
        }

        if (!this.isEdit) {
            setTimeout(() => {
                this.myInput.nativeElement.select();
            }, 300);
        }

        //this.editable = this.addressObj.editableAddress[1];
        this.isEdit = !this.isEdit;
    }

    //guardan el orden en la lista de clientes para vendedores
    saveOrder(){
        if(this.todo.value != this.prevOrden){
            //consumir servicio para guardar
            let params:any ={};
            params.orden = this.todo.value.valor;
            params.tienda_id = this.shopId;
            params.dia_visita = this.visitDay;
            this.cashregister.updateCustomOrden(params).subscribe(async res =>{
                if(res.code == 1){
                    this.isEdit = !this.isEdit;
                    console.log(this.isEdit);
                    this.presentToast("Se actualizó la posición de la tienda correctamente, posición "+ params.orden);
                    //this.reorderStoresPosition(res.content);
                }else{
                    this.presentToast("Ocurrio un error al asignar la posición a la tienda.");
                }
            });
            //ordenar la lista de tiendas
        }
    }

   async reorderStoresPosition(res){
   //async reorderStoresPosition(){
        await this.storage.get('user').then(data => {
            data = JSON.parse(data);
            console.log(data);
            let tiendas = data.tiendas;
            let ii = null;
            let elementTemp = null;

            for (let i = 0; i < tiendas.length; i++) {
                if (res.tienda == tiendas[i].id) {
                    console.log("indice", i);
                    ii = i;
                    elementTemp = tiendas[i];
                    break;
                }
            }
            console.log(ii,"indices");
            console.log(elementTemp,"elemente");
            tiendas.splice(ii,1);
            console.log(tiendas);
            // tiendas.forEach((element,index,object) => {
            //     if(res.tienda == element.id){
            //         console.log("indice",index);
            //         i = index;
            //         elementTemp = element;
            //     }
            // });
            
        });
    }

    async presentToast(msj) {
        const toast = await this.toastCtrl.create({
            message: msj,
            duration: 4000,
            position: "bottom"
        });
        toast.present();
    }
}

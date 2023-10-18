import {Component, OnInit} from '@angular/core';
import {ModalController, NavParams, ToastController} from '@ionic/angular';
import {CreatePostAction} from '../../../store/comunidad-tenderos.actions';
import {Store} from '@ngrx/store';
import {AppState} from 'src/app/store/app.reducer';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import {ActivatedRoute} from '@angular/router';
import {IUser} from 'src/app/interfaces/IUser';
import {File, FileEntry} from '@ionic-native/file/ngx';
import {WebView} from '@ionic-native/ionic-webview/ngx';
import {LoadingOn} from 'src/app/modules/compartido/general/store/actions/loading.actions';

@Component({
    selector: 'app-comunidad-tenderos-crear-post',
    templateUrl: './comunidad-tenderos-crear-post.component.html',
    styleUrls: ['./comunidad-tenderos-crear-post.component.scss'],
})


export class ComunidadTenderosCrearPostComponent implements OnInit {

    public formData: FormGroup;
    public photoCamera: any;
    public user: IUser;


    constructor(private modalController: ModalController,
                private store: Store<AppState>,
                private formBuilder: FormBuilder,
                private camera: Camera,
                private route: ActivatedRoute,
                private navParams: NavParams,
                private file: File,
                private webview: WebView,
                private toastController: ToastController) {
    }

    private win: any = window;


    ngOnInit() {
        this.user = this.navParams.get('user');
        this.formData = this.formBuilder.group({
            text: ['', [Validators.required]]
        });
    }

    crearPost() {
        this.store.dispatch(new LoadingOn());
        let data = {
            titulo: this.user.nombre_contacto,
            texto: this.formData.get('text').value,
            file: this.photoCamera
        };
        this.store.dispatch(new CreatePostAction(this.user.token, data));
    }

    closeModal() {
        this.modalController.dismiss();
    }

    makePhoto() {
        const options: CameraOptions = {
            quality: 50,
            destinationType: this.camera.DestinationType.DATA_URL,
            sourceType: this.camera.PictureSourceType.CAMERA,
            //allowEdit: true,
            encodingType: this.camera.EncodingType.JPEG,
            targetWidth: 450,
            //targetHeight: 700,
            saveToPhotoAlbum: false,
            correctOrientation:true
        };
        this.camera.getPicture(options).then((img) => {
            this.photoCamera = 'data:image/jpeg;base64,' + img;
        }, (err) => {});
    }


    createFileName() {
        var d = new Date(),
            n = d.getTime(),
            newFileName = n + '.jpg';
        return newFileName;
    }

    moveFileToLocalDir(namePath, currentName, newFileName) {
        this.file.moveFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {

            let filePath = this.file.dataDirectory + newFileName;
            let resPath = this.pathForImage(filePath);

            this.photoCamera = {
                name: newFileName,
                path: resPath,
                filePath: filePath
            };
        }, error => {
            this.presentToast('Error while storing file.');
        });
    }

    pathForImage(img) {
        if (img == null) {
            return '';
        } else {
            let converted = this.win.Ionic.WebView.convertFileSrc(img);
            return converted;
        }
    }

    async presentToast(text) {
        const toast = await this.toastController.create({
            message: text,
            position: 'bottom',
            duration: 3000
        });
        toast.present();
    }

    startUpload() {
        this.file.resolveLocalFilesystemUrl(this.photoCamera.filePath)
            .then(entry => {
                (<FileEntry>entry).file(file => this.readFile(file));
            })
            .catch(err => {
                this.presentToast('Error while reading file.');
            });
    }

    readFile(file: any) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const formData = new FormData();
            const imgBlob = new Blob([reader.result], {
                type: file.type
            });
            formData.append('token', this.user.token);
            formData.append('titulo', 'ad');
            formData.append('texto', 'asd');
            formData.append('file', imgBlob, file.name);
            this.store.dispatch(new CreatePostAction(this.user.token, formData));
        };
        reader.readAsArrayBuffer(file);
    }


}

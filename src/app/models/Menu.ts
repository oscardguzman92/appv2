import {CompartidoMenuVendedorComponent} from '../modules/vendedor/compartido/components/compartido-menu-vendedor/compartido-menu-vendedor.component';
import {CompartidoMenuTenderoComponent} from '../modules/tendero/compartido/components/compartido-menu-tendero/compartido-menu-tendero.component';
import {CompartidoMenuMercaderistaComponent} from '../modules/mercaderista/compartido/components/compartido-menu-mercaderista/compartido-menu-mercaderista.component';
import {CompartidoMenuSuperVendedorComponent} from '../modules/super-vendedor/compartido/components/compartido-menu-super-vendedor/compartido-menu-super-vendedor.component';
import {CompartidoMenuTransportadorComponent} from '../modules/transportador/compartido/components/compartido-menu-transportador/compartido-menu-transportador.component';

export class Menu {
    public static menuVendedor() {
        return CompartidoMenuVendedorComponent;
    }

    public static menuTendero() {
        return CompartidoMenuTenderoComponent;
    }

    public static menuMercaderista() {
        return CompartidoMenuMercaderistaComponent;
    }

    public static menuTransportador() {
        return CompartidoMenuTransportadorComponent;
    }

    public static menuSuperVendedor() {
        return CompartidoMenuSuperVendedorComponent;
    }

}

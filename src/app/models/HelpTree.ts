import { IOption, ITag, IRedirect } from '../interfaces/IHelpTree';
export class HelpTreeModel {
    public option: IOption[];
    public tag: ITag;
    public redirect: IRedirect;
    constructor(model: any) {
        Object.assign(this, model);
    }
}

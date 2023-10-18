export interface IOption {
    redirect_id: string;
    option: string;
    click: string;
    key: string;
}

export interface ITag {
    tag: string;
    click: string;
}

export interface IRedirect {
    redirect: string;
    type: string;
}

export interface IHelpTree {
    _id: string;
    id: string;
    name: string;
    type: string;
    description: string;
    title: string;
    image: string;
    video: string;
    redirect: string;
    children: IHelpTree[];
}


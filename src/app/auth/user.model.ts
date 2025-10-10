export interface IUserData extends ApiUser {
    token: string;
    tokenExpirationDate: Date;
}

export class User {
    private _userData: IUserData;

    constructor(data: IUserData) {
        this._userData = data;
    }

    static fromApiResponse(user: ApiUser, token: string, expirationDate: Date): User {
        return new User({
            ...user,
            token,
            tokenExpirationDate: expirationDate
        });
    }

    get token(): string | null {
        if (!this._userData.tokenExpirationDate || new Date() > this._userData.tokenExpirationDate) {
            return null;
        }
        return this._userData.token;
    }

    toJSON() {
        return this._userData;
    }
}

export interface ApiUser {
    name:      string;
    email:     string;
    age:       number;
    _id:       string;
    createdAt: Date;
    updatedAt: Date;
    __v:       number;
    id:        string;
}

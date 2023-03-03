
export class CoffeeMapper {
    private json: any;
    private thisReference: any;

    constructor(thisReference: any, json: any) {
        this.thisReference = thisReference;
        this.json = json;
        this.properties();
    }

    protected properties(): CoffeeMapper {
        if(this.json != null) {
            const keys = Object
            .keys(this.thisReference)
            .filter(k => 
                this.thisReference[k]?.constructor?.name != 'Object' && 
                this.thisReference[k]?.constructor?.name != 'Array'
            );

            for (const key of keys) {
                this.thisReference[key] = this.json[key];
            }
        }

        return this;
    }

    /**
     * This method will create the instance of the object | array
     * @example Given the object { user: { }, animals: [{...}]}
     * 
     * createInstance('user', User) results in => User {...}
     * createInstance('animals', Animal) results in => Animal [{...}]
     */
    public createInstance<T>(propertyName: string, type: new (val: any) => T): CoffeeMapper {
        if(this.json != null) {
            const key = Object.keys(this.thisReference).find(k => k == propertyName);

            if(!key) {
                return this;
            }

            if(this.json[key]?.constructor?.name == 'Object') 
            {
                if(this.json.hasOwnProperty(key)) {
                    this.thisReference[key] = new type(this.json[key]);
                }
            }
            else if(this.thisReference[key]?.constructor?.name == 'Array') 
            {
                if(this.json.hasOwnProperty(key) && this.json[key]?.constructor?.name == 'Array') {
                    
                    if(this.json[key].length && 
                        (typeof this.json[key][0] === "string" || 
                        typeof this.json[key][0] === "number")
                    ) {
                        this.thisReference[key] = this.json[key];
                    }   
                    else {
                        this.thisReference[key] = this.json[key].map((m: any) => new type(m));
                    }
                }
            }
        }

        return this;
    }
}
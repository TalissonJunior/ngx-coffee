import { CoffeeMapper } from "./coffee-mapper";

export class CoffeeModel {

    /**
     * @example map({ id: 1, name: 'string'})
     */
    protected map(model: any): CoffeeMapper {
        return new CoffeeMapper(this, model);
    }
}
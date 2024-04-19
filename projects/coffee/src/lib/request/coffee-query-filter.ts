import * as moment from "moment";

export interface CoffeeQueryFilter { 
    expression: string;
    type: 'sort' | 'filter' | 'parameter'
}

const getPropertyName = (type: ((model: any) => any) | string) => {
    if(typeof type === 'string') {
        return type;
    }

    const parsedTypeValues = type.toString().split('.');
    let propertyName = '';

    if(parsedTypeValues.length > 0) {
        parsedTypeValues.shift();
        propertyName = parsedTypeValues.join('.');
    }

    return propertyName;
}

/**
 * @summary
 * Search values by the exact condition
 * @example 
 * .where('name', '==', 'text')
 * .where((model) => model.name, '==', 'text')
 * .where((model) => model.age, '>', 18)
 */
export const where = (
    type: ((model: any) => any) | string, 
    operator: '==' | '!=' | '>=' | '<=' | '>' | '<' | '<', 
    value: string | number
): CoffeeQueryFilter => {
    const propertyName = getPropertyName(type);

    return {
        expression: `${propertyName}${operator}${value}`,
        type: 'filter'
    };
}

/**
 * @summary
 * Search values by a boolean type
 * @example 
 * .where('hasStatus', true)
 * .where((model) => model.isValid, false)
 */
export const whereIs = (
    type: ((model: any) => any) | string, 
    value: boolean
): CoffeeQueryFilter => {
    const propertyName = getPropertyName(type);

    return {
        expression: `${propertyName}==${value}`,
        type: 'filter'
    };
}

/**
 * @summary
 * Search values that contains the value, it will use '%like%' on database
 * @example 
 * .whereContains('name', 'text')
 * .whereContains((model) => model.name, 'text')
 */
export const whereContains = (
    type: ((model: any) => any) | string, 
    value: string
): CoffeeQueryFilter => {
    const propertyName = getPropertyName(type);

    return {
        expression: `${propertyName}@=${value}`,
        type: 'filter'
    };
}

/**
 * @summary
 * Search value that is in array
 * @example 
 * .whereIn('id', 'year', [1,2])
 * .whereIn((model) => model.id, [1,2])
 */
export const whereIn = (
    type: ((model: any) => any) | string,
    values: string[] | number[]
): CoffeeQueryFilter => {
    const propertyName = getPropertyName(type);
    const operator = '@IN@';
    const value = values.join("||");

    return {
        expression: `${propertyName}${operator}${value}`,
        type: 'filter'
    };
}

/**
 * @summary
 * Search value that is not in array
 * @example 
 * .whereNotIn('id', [1,2])
 * .whereNotIn((model) => model.id, [1,2])
 */
export const whereNotIn = (
    type: ((model: any) => any) | string,
    values: string[] | number[]
): CoffeeQueryFilter => {
    const propertyName = getPropertyName(type);
    const operator = '@NOTIN@';
    const value = values.join("||");

    return {
        expression: `${propertyName}${operator}${value}`,
        type: 'filter'
    };
}

/**
 * @summary
 * Search value that is in array
 * @example 
 * .whereOr([where('name', '==', 'bmx'), whereContains('name', 'a')],[whereDate('createdAt', 'DD-MM-YYYY', '27-10-2022')])
 *
 * result => (name == 'bmx' AND name LIKE '%a%') OR (createdAt == '27-10-2022')
 */
 export const whereOr = (...filters: CoffeeQueryFilter[][]): CoffeeQueryFilter => {
    const operator = '@or@';
    
    const expression = filters.map(filter => 
        filter.map(value => value.expression.replace(',', "@:@")).join('@:@')
    ).join(operator);

    return {
        expression: expression,
        type: 'filter'
    };
}

/**
 * @summary
 * Search date by 'day'
 * @example 
 * .whereDay('createdAt', moment())
 * .whereDay((model) => model.createdAt, new Date())
 */
export const whereDay = (
    type: ((model: any) => any) | string, 
    value: moment.Moment | Date
): CoffeeQueryFilter => {
    const propertyName = getPropertyName(type);
    return {
        expression:`${propertyName}=day=${moment(value).format("DD")}`,
        type: 'filter'
    }
}

/**
 * @summary
 * Search date by 'month'
 * @example 
 * .whereMonth('createdAt', moment())
 * .whereMonth((model) => model.createdAt, new Date())
 */
export const whereMonth = (
    type: ((model: any) => any) | string, 
    value: moment.Moment | Date
): CoffeeQueryFilter => {
    const propertyName = getPropertyName(type);
    return {
        expression:`${propertyName}=month=${moment(value).format("M")}`,
        type: 'filter'
    }
}

/**
 * @summary
 * Search date by 'year'
 * @example 
 * .whereYear('createdAt', moment())
 * .whereYear((model) => model.createdAt, new Date())
 */
export const whereYear = (
    type: ((model: any) => any) | string, 
    value: moment.Moment | Date
): CoffeeQueryFilter => {
    const propertyName = getPropertyName(type);
    return {
        expression:`${propertyName}=year=${moment(value).format("YYYY")}`,
        type: 'filter'
    }
}

/**
 * @summary
 * Search date by 'day' and 'month'
 * @example 
 * .whereYear('createdAt', moment())
 * .whereYear((model) => model.createdAt, new Date())
 */
export const whereDayAndMonth = (
    type: ((model: any) => any) | string, 
    value: moment.Moment | Date
): CoffeeQueryFilter => {
    return {
        expression:`${whereDay(type, value).expression},${whereMonth(type, value).expression}`,
        type: 'filter'
    }
}

/**
 * @summary
 * Search date by 'day' and 'year'
 * @example 
 * .whereYear('createdAt', moment())
 * .whereYear((model) => model.createdAt, new Date())
 */
export const whereDayAndYear = (
    type: ((model: any) => any) | string, 
    value: moment.Moment | Date
): CoffeeQueryFilter => {
    return {
        expression:`${whereDay(type, value).expression},${whereYear(type, value).expression}`,
        type: 'filter'
    }
}

/**
 * @summary
 * Search date by 'month' and 'year'
 * @example 
 * .whereYear('createdAt', moment())
 * .whereYear((model) => model.createdAt, new Date())
 */
export const whereMonthAndYear = (
    type: ((model: any) => any) | string, 
    value: moment.Moment | Date
): CoffeeQueryFilter => {
    return {
        expression:`${whereMonth(type, value).expression},${whereYear(type, value).expression}`,
        type: 'filter'
    }
}

/**
 * @summary
 * Search date by 'day', 'month' and 'year'
 * @example 
 * .whereYear('createdAt', moment())
 * .whereYear((model) => model.createdAt, new Date())
 */
export const whereDayAndMonthAndYear = (
    type: ((model: any) => any) | string, 
    value: moment.Moment | Date
): CoffeeQueryFilter => {
    return {
        expression:`${whereDay(type, value).expression},${whereMonth(type, value).expression},${whereYear(type, value).expression}`,
        type: 'filter'
    }
}

/**
 * @summary
 * Sort by property
 * @example 
 * .sortBy('createdAt', 'desc')
 * .sortBy((model) => model.createdAt, 'asc')
 */
 export const sortBy = (
    type: ((model: any) => any) | string, 
    sort: 'asc' | 'desc'
): CoffeeQueryFilter => {
    const propertyName = getPropertyName(type);
    const sortSymbol = sort == 'asc' ? '': '-';

    return {
        expression: `${sortSymbol}${propertyName}`,
        type: 'sort'
    };
}

/**
 * @summary
 * Sets query Parameter
 * @example 
 * .withQueryParameter('name', 'text')
 * .withQueryParameter((model) => model.name, 'text')
 */
 export const withQueryParameter = (
    type: ((model: any) => any) | string, 
    value: string | number
): CoffeeQueryFilter => {
    const propertyName = getPropertyName(type);

    return {
        expression: `${propertyName}=${value}`,
        type: 'parameter'
    };
}
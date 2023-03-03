
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
 export const whereOr = (left: CoffeeQueryFilter[], right: CoffeeQueryFilter[]): CoffeeQueryFilter => {
    const leftExpressions = left.map(value => value.expression.replace(',', "@:@")).join('@:@');
    const rightExpressions = right.map(value => value.expression.replace(',', "@:@")).join('@:@');
    const operator = '@or@';

    return {
        expression: `${leftExpressions}${operator}${rightExpressions}`,
        type: 'filter'
    };
}

/**
 * @summary
 * Search date by 'month', 'day'....
 * @example 
 * .where('createdAt', 'year', 2022)
 * .where((model) => model.createdAt, 'day', 2)
 * .where((model) => model.createdAt, 'month', 4)
 * .where((model) => model.createdAt, 'DD-YYYY', '04-2022')
 * .where((model) => model.createdAt, 'DD-MM-YYYY', '27-10-2022')
 */
 export const whereDate = (
    type: ((model: any) => any) | string, 
    compare: 'day' | 'month' | 'year' | 'DD-MM' | 'DD-YYYY' | 'MM-YYYY' | 'DD-MM-YYYY',  
    value: string | number
): CoffeeQueryFilter => {
    const propertyName = getPropertyName(type);

    const getExpression = (
        typeFormat: 'day' | 'month' | 'year' | null, 
        formattedValue?: string | number
    ) => {
        if(!typeFormat) {
            return '';
        }

        return `${propertyName}=${typeFormat}=${formattedValue}`;
    }

    const getValueBySplitPosition = (position: number = 0): string => {
        const splitValue = value.toString().split('-');
        
        if(splitValue.length <= 0) {
            return '';
        }

        if(splitValue.length > position) {
            return splitValue[position];
        }

        return '';
    }

    if(compare == 'day' || compare == 'month' || compare == 'year') {
        return {
            expression: getExpression(compare, value),
            type: 'filter'
        }
    }
    else if(compare == 'DD-MM') {
        const day = getValueBySplitPosition(0);
        const month = getValueBySplitPosition(1);

        if(!day || !month) {
            return { expression: '', type: 'filter'};
        }

        return {
            expression: getExpression('day', day) + ',' + getExpression('month', month),
            type: 'filter'
        }
    }
    else if(compare == 'DD-YYYY') {
        const day = getValueBySplitPosition(0);
        const year = getValueBySplitPosition(1);

        if(!day || !year) {
            return { expression: '', type: 'filter' };
        }

        return {
            expression: getExpression('day', day) + ',' + getExpression('year', year),
            type: 'filter'
        }
    }
    else if(compare == 'MM-YYYY') {
        const month = getValueBySplitPosition(0);
        const year = getValueBySplitPosition(1);

        if(!month || !year) {
            return { expression: '', type: 'filter' };
        }

        return {
            expression: getExpression('month', month) + ',' + getExpression('year', year),
            type: 'filter'
        }
    }
    else if(compare == 'DD-MM-YYYY') {
        const day = getValueBySplitPosition(0);
        const month = getValueBySplitPosition(1);
        const year = getValueBySplitPosition(2);

        if(!day || !month || !year) {
            return { expression: '', type: 'filter' };
        }

        return {
            expression: getExpression('day', day) + ',' + getExpression('month', month) + ',' + getExpression('year', year),
            type: 'filter'
        }
    }

    return {
        expression: ``,
        type: 'filter'
    };
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
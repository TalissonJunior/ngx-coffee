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
 * Filter by date with various options for filtering by day, month, year, or combinations.
 * 
 * @param type The property name or a lambda function to specify the property.
 * @param operator The comparison operator to use ('==', '!=', '<=', '<', '>=', '>').
 * @param date The date value to compare.
 * @param filterBy Specifies the components of the date to filter by ('day', 'month', 'year', 'day-month', 'day-year', 'month-year', 'day-month-year', 'full-date').
 * 
 * @example
 * // Filter by day
 * whereDate('createdAt', '==', new Date(), 'day');
 * whereDate((model) => model.createdAt, '==', new Date(), 'day');
 * 
 * @example
 * // Filter by month
 * whereDate('createdAt', '==', new Date(), 'month');
 * whereDate((model) => model.createdAt, '==', new Date(), 'month');
 * 
 * @example
 * // Filter by year
 * whereDate('createdAt', '==', new Date(), 'year');
 * whereDate((model) => model.createdAt, '==', new Date(), 'year');
 * 
 * @example
 * // Filter by day and month
 * whereDate('createdAt', '==', new Date(), 'day-month');
 * whereDate((model) => model.createdAt, '==', new Date(), 'day-month');
 * 
 * @example
 * // Filter by day and year
 * whereDate('createdAt', '==', new Date(), 'day-year');
 * whereDate((model) => model.createdAt, '==', new Date(), 'day-year');
 * 
 * @example
 * // Filter by month and year
 * whereDate('createdAt', '==', new Date(), 'month-year');
 * whereDate((model) => model.createdAt, '==', new Date(), 'month-year');
 * 
 * @example
 * // Filter by day, month, and year
 * whereDate('createdAt', '==', new Date(), 'day-month-year');
 * whereDate((model) => model.createdAt, '==', new Date(), 'day-month-year');
 * 
 * @example
 * // Filter by full date, (YYYY-MM-DD HH:mm:ss)
 * whereDate('createdAt', '==', new Date());
 * whereDate((model) => model.createdAt, '==', new Date());
 */
export const whereDate = (
    type: ((model: any) => any) | string, 
    operator: '==' | '!=' | '<=' | '<' | '>=' | '>', 
    date: Date, 
    filterBy: 'day' | 'month' | 'year' | 'day-month' | 'day-year' | 'month-year' | 'day-month-year' | 'full-date' = 'full-date'
): CoffeeQueryFilter => {
    const propertyName = getPropertyName(type);

    // Format the date components
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const fullDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    // Add operator prefix
    let operatorPrefix = '';
    switch (operator) {
        case '==':
            operatorPrefix = 'cEqualDate';
            break;
        case '!=':
            operatorPrefix = 'cNotEqualDate';
            break;
        case '<=':
            operatorPrefix = 'cLessEqualDate';
            break;
        case '<':
            operatorPrefix = 'cLessDate';
            break;
        case '>=':
            operatorPrefix = 'cGreaterEqualDate';
            break;
        case '>':
            operatorPrefix = 'cGreaterDate';
            break;
    }

    let expression = '';
    switch (filterBy) {
        case 'day':
            expression = `${operatorPrefix}${propertyName}=day=${day}`;
            break;
        case 'month':
            expression = `${operatorPrefix}${propertyName}=month=${month}`;
            break;
        case 'year':
            expression = `${operatorPrefix}${propertyName}=year=${year}`;
            break;
        case 'day-month':
            expression = `${operatorPrefix}${propertyName}=day=${day},${operatorPrefix}${propertyName}=month=${month}`;
            break;
        case 'day-year':
            expression = `${operatorPrefix}${propertyName}=day=${day},${operatorPrefix}${propertyName}=year=${year}`;
            break;
        case 'month-year':
            expression = `${operatorPrefix}${propertyName}=month=${month},${operatorPrefix}${propertyName}=year=${year}`;
            break;
        case 'day-month-year':
            expression = `${operatorPrefix}${propertyName}=day=${day},${operatorPrefix}${propertyName}=month=${month},${operatorPrefix}${propertyName}=year=${year}`;
            break;
        case 'full-date':
            expression = `${operatorPrefix}${propertyName}=full-date=${fullDate}`;
            break;
    }

    return {
        expression: expression,
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
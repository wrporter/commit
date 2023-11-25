export function groupBy<T extends Record<string, any>>(array: T[], key: keyof T) {
    return array.reduce(
        (accu, value) => {
            if (accu[value[key]]) {
                accu[value[key]].push(value);
            } else {
                accu[value[key]] = [value];
            }
            return accu;
        },
        {} as Record<string, T[]>,
    );
}

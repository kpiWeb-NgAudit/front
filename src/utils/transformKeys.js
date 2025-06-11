export const snakeToPascal = (str) => {
    if (!str) return str;

    if (str.toLowerCase().endsWith("_pk")) {
        const prefix = str.slice(0, -3); // Remove "_pk"
        return prefix.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('') + 'Pk';
    }

    return str.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
};
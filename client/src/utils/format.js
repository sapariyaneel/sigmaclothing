/**
 * Format a date string to a more readable format
 * @param {string} dateString - The date string to format
 * @returns {string} The formatted date string
 */
export const formatDate = (dateString) => {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

/**
 * Format a number as Indian currency (INR)
 * @param {number} amount - The amount to format
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}; 
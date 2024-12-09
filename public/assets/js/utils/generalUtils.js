export function formatPhoneNumber(phoneNumber){
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    if(cleaned.length != 10) {
        return phoneNumber;
    }
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phoneNumber;
}
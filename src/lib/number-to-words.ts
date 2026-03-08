
/**
 * Utility to convert numbers to Spanish currency words.
 * Simple implementation for prototype purposes.
 */

export function numberToWords(num: number): string {
  const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const tens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const tensMultiplier = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  function convertGroup(n: number): string {
    let output = '';

    if (n === 100) return 'CIEN';
    
    if (n >= 100) {
      output += hundreds[Math.floor(n / 100)] + ' ';
      n %= 100;
    }

    if (n >= 10 && n <= 19) {
      output += tens[n - 10];
    } else if (n >= 20) {
      output += tensMultiplier[Math.floor(n / 10)];
      if (n % 10 > 0) output += ' Y ' + units[n % 10];
    } else {
      output += units[n];
    }

    return output.trim();
  }

  if (num === 0) return 'CERO PESOS 00/100 M.N.';

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  let result = '';
  let tempNum = integerPart;

  if (tempNum >= 1000000) {
    const millions = Math.floor(tempNum / 1000000);
    result += (millions === 1 ? 'UN MILLON' : convertGroup(millions) + ' MILLONES') + ' ';
    tempNum %= 1000000;
  }

  if (tempNum >= 1000) {
    const thousands = Math.floor(tempNum / 1000);
    result += (thousands === 1 ? 'MIL' : convertGroup(thousands) + ' MIL') + ' ';
    tempNum %= 1000;
  }

  if (tempNum > 0) {
    result += convertGroup(tempNum);
  }

  const cents = decimalPart.toString().padStart(2, '0');
  return `(${result.trim()} PESOS ${cents}/100 M.N.)`;
}

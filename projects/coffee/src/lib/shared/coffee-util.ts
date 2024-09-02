export namespace CoffeeUtil {
  const blueColorCode = '\x1b[34m'; // ANSI escape code for blue
  const whiteColorCode = '\x1b[37m'; // ANSI escape code for white
  const greyColorCode = '\x1b[90m'; // ANSI escape code for grey
  const resetColorCode = '\x1b[0m'; // ANSI escape code to reset color

  export const concatUrl = (currentUrl: string, suffixUrl: string | number): string => {
    if (!suffixUrl) {
      return currentUrl;
    }

    let parsedSuffixUrl = String(suffixUrl);

    if (!parsedSuffixUrl) {
      return currentUrl;
    }
    
    if (currentUrl.endsWith('/')) {
      currentUrl = currentUrl.substring(0, currentUrl.length - 1);
    }

    if (parsedSuffixUrl.startsWith('/')) {
      parsedSuffixUrl = parsedSuffixUrl.substring(1, parsedSuffixUrl.length);
    }

    return `${currentUrl}/${parsedSuffixUrl}`;
  }

  export const convertModelToFormData = (val: any, formData = new FormData(), namespace = ''): FormData => {
    if (typeof val !== 'undefined' && val !== null) {
      if (val instanceof Date) {
        formData.append(namespace, val.toISOString());
      } else if (val instanceof Array) {
        for (let index = 0; index < val.length; index++) {
          const element = val[index];
          CoffeeUtil.convertModelToFormData(
            element,
            formData,
            namespace + '[' + index + ']'
          );
        }
      } else if (typeof val === 'object' && !(val instanceof File)) {
        for (const propertyName in val) {
          if (val.hasOwnProperty(propertyName)) {
            CoffeeUtil.convertModelToFormData(
              val[propertyName],
              formData,
              namespace ? namespace + '.' + propertyName : propertyName
            );
          }
        }
      } else if (val instanceof File) {
        formData.append(namespace, val);
      } else {
        formData.append(namespace, val.toString());
      }
    }
    return formData;
  }

  export const formatCoffeeLogMessage = (content: string): string => {
    const logHeader = `${blueColorCode}################ 📒 COFFEE LOG ################${resetColorCode}`;
    const formattedDate = formatDate(new Date(), 'dd-MM-yyyy HH:mm:ss'); // Format date in 'dd-MM-yyyy HH:mm:ss'
    
    // Split the content by newline
    const lines = content.split('\n');
    const timestamp = `${whiteColorCode}📅 [${formattedDate}]${resetColorCode}`;

    // Build the log message
    let logMessage = `\n${logHeader}\n${timestamp}\n`;

    lines.forEach(line => {
      logMessage += `${colorizeLogMessage(line.trim())}\n`; // Colorize each line
    });

    logMessage += `${logHeader}\n`;

    // Add the message for disabling logs in grey
    const disableLogsMessage = 'To disable Coffee logs, pass "disableLogs: true" when calling CoffeeModule.forRoot({ disableLogs: true })';
    logMessage += `${greyColorCode}${disableLogsMessage}${resetColorCode}\n`;

    return logMessage;
  };

  // Helper function to colorize log messages
  function colorizeLogMessage(message: string): string {
    const yellowColorCode = '\x1b[33m'; // ANSI escape code for yellow
    return `${yellowColorCode}${message}${resetColorCode}`;
  }

  // Helper function to format date
  function formatDate(date: Date, format: string): string {
    const pad = (num: number) => num.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }
}

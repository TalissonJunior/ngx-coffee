export namespace CoffeeUtil {
  const whiteColorCode = '\x1b[37m'; // ANSI escape code for white
  const resetColorCode = '\x1b[0m'; // ANSI escape code to reset color

  export const formatCoffeeLogMessage = (content: string): string => {
    const formattedDate = formatDate(new Date()); // Format date in 'dd-MM-yyyy HH:mm:ss'

    // Build the timestamp with date formatting
    const timestamp = `[${formattedDate}] `;

    // Construct the log message with colored timestamp and message
    const logMessage = `${whiteColorCode}${timestamp}${resetColorCode}${colorizeLogMessage(content)}`;

    // Use .trimEnd() to remove any trailing whitespace or newlines
    return logMessage.trimEnd();
  };

  // Helper function to colorize log messages (now using blue color)
  function colorizeLogMessage(message: string): string {
    const blueColorCode = '\x1b[34m'; // ANSI escape code for blue
    return `${blueColorCode}${message}${resetColorCode}`;
  }

  // Helper function to format date
  function formatDate(date: Date): string {
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

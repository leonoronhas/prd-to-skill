const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export interface Spinner {
  update: (message: string) => void;
  stop: (message: string) => void;
}

export const createSpinner = (message: string): Spinner => {
  let i = 0;
  const stream = process.stderr;

  const write = (text: string) => {
    stream.write(`\r\x1b[K${text}`);
  };

  write(`${frames[0]} ${message}`);

  const timer = setInterval(() => {
    i = (i + 1) % frames.length;
    write(`${frames[i]} ${message}`);
  }, 80);

  return {
    update: (msg: string) => {
      message = msg;
      write(`${frames[i]} ${message}`);
    },
    stop: (msg: string) => {
      clearInterval(timer);
      write(`${msg}\n`);
    },
  };
};

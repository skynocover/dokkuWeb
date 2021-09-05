import { NodeSSH } from 'node-ssh';
import fs from 'fs';

export class Client {
  private ssh: NodeSSH;
  private host: string;
  private username: string;
  private init: boolean;

  constructor(host: string, username: string) {
    this.host = host;
    this.username = username;
    this.ssh = new NodeSSH();
    this.init = false;
  }

  async initial(privateKey: string) {
    await this.ssh.connect({ host: this.host, username: this.username, privateKey });
    this.init = true;
  }

  isInit(): boolean {
    return this.init;
  }

  async execCommand(command: string): Promise<string> {
    const result = await this.ssh.execCommand(command);
    if (result.stderr !== '') throw new Error(result.stderr);
    return result.stdout;
  }

  async execCommandReturnNotString(command: string): Promise<void> {
    await this.ssh.execCommand(command);
  }
}

export class SSHClient {
  private ssh: NodeSSH;

  constructor(ssh: NodeSSH) {
    this.ssh = ssh;
  }

  static async generate(host: string, username: string, privateKey: string): Promise<SSHClient> {
    const ssh = new NodeSSH();
    await ssh.connect({ host, username, privateKey });

    return new SSHClient(ssh);
  }

  async execCommand(command: string): Promise<string> {
    const result = await this.ssh.execCommand(command);
    if (result.stderr !== '') throw new Error(result.stderr);
    return result.stdout;
  }

  async execCommandReturnNotString(command: string): Promise<void> {
    await this.ssh.execCommand(command);
  }

  async putFile(local: string, remote: string) {
    await this.ssh.putFile(local, remote);
    return;
  }
}

const readfile = (): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    fs.readFile('dokku', function (err, data) {
      if (err) {
        reject(err);
        return;
      }
      resolve(data.toString());
    });
  });
};

const client = new Client(process.env.SSH_SERVER || '', process.env.SSH_USER || '');

// (async () => {
//   if (process.env.NODE_ENV === 'development') {
//     const data = await readfile();
//     client.initial(data);
//   }
// })();

export { client };

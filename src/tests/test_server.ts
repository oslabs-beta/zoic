import { Application, Router } from "../../deps.ts";
import type { ApplicationListenEvent } from "../../deps.ts";

// Test server setup utility with proper cleanup
export class TestServer {
  private app: Application;
  private controller: AbortController;
  private router: Router;
  private port?: number;

  constructor() {
    this.app = new Application();
    this.controller = new AbortController();
    this.router = new Router();
    this.app.use(this.router.routes());
  }

  public getRouter(): Router {
    return this.router;
  }

  public getPort(): number {
    return this.port ?? 80;
  }

  public start(): Promise<number> {
    this.controller = this.createAbortController();
    return new Promise((resolve) => {
      const listener = (evt: ApplicationListenEvent) => {
        this.port = evt.port;
        resolve(evt.port);
      };

      this.app.addEventListener("listen", listener, { once: true });

      this.app.listen({
        port: 0,
        signal: this.controller.signal,
      });
    });
  }

  public stop(): void {
    this.controller.abort();
  }

  private createAbortController(): AbortController {
      return new AbortController();
  }
}

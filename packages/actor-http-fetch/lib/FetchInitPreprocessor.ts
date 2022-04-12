import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { ActorHttp } from '@comunica/bus-http';
import type { IFetchInitPreprocessor } from './IFetchInitPreprocessor';

/**
 * Overrides the HTTP agent to perform better in Node.js.
 */
export class FetchInitPreprocessor implements IFetchInitPreprocessor {
  private readonly agent: (url: URL) => HttpAgent;

  public constructor(agentOptions: any) {
    const httpAgent = new HttpAgent(agentOptions);
    const httpsAgent = new HttpsAgent(agentOptions);
    this.agent = (_parsedURL: URL): HttpAgent => _parsedURL.protocol === 'http:' ? httpAgent : httpsAgent;
  }

  public handle(init: RequestInit): RequestInit {
    // Convert body Web stream to Node stream, as node-fetch does not support Web streams
    if (init.body && typeof init.body !== 'string' && 'getReader' in <any> init.body) {
      init.body = <any> ActorHttp.toNodeReadable(<any> init.body);
    }

    return <any> { ...init, agent: this.agent };
  }
}
